import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './core/database/prisma/prisma.service';
import { BlockchainServiceFactory } from './core/blockchain/blockchain.factory';
import { Chain } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { IndexerServiceFactory } from './core/indexer/indexer.factory';
import { IndexerUtil } from './core/indexer/indexer.utils';
import cluster, { Worker } from 'node:cluster';
import EventEmitter from 'node:events';
import { Env } from './env';

interface IndexerWorkerMessage {
  chainId: number;
  startBlockNumber: number;
  endBlockNumber: number;
}

@Injectable()
export class BootstrapService extends EventEmitter {
  private readonly logger = new Logger(BootstrapService.name);
  private readonly batchSize: number;
  private readonly workerNum: number;

  private chains: Chain[] = [];
  private currentChainIndex = 0;
  private tipBlockNumbers: { [chainId: number]: number } = {};
  private nextBlockNumbers: { [chainId: number]: number } = {};
  private activeWorkers = 0;

  public bootstraped = new Promise((resolve) => {
    this.on('bootstrap:complete', () => {
      resolve(undefined);
    });
  });

  constructor(
    private configService: ConfigService<Env>,
    private prismaService: PrismaService,
    private blockchainServiceFactory: BlockchainServiceFactory,
    private indexerServiceFactory: IndexerServiceFactory,
    private indexerUtil: IndexerUtil,
  ) {
    super();
    this.batchSize = this.configService.get('INDEXER_BATCH_SIZE')!;
    this.workerNum = this.configService.get('INDEXER_WORKER_NUM')!;
  }

  public async bootstrap(): Promise<void> {
    if (cluster.isPrimary) {
      const now = performance.now();
      this.bootstraped.then(() => {
        this.logger.warn(`Bootstrap complete in ${performance.now() - now}ms`);
      });
      await this.indexerServiceFactory.cleanIndexerQueueJobs();
      await this.runMaster();
    } else {
      await this.runWorker();
    }
  }

  public workerReady() {
    if (cluster.isPrimary) {
      return;
    }
    this.logger.log(`Indexer Worker ${process.pid} is ready`);
    cluster.worker!.send({ ready: true });
  }

  private async runMaster() {
    this.logger.log(`Indexer Master ${process.pid} is running`);
    this.chains = await this.prismaService.chain.findMany();
    for (const chain of this.chains) {
      // const blockchainService = await this.blockchainServiceFactory.getService(chain.id);
      // this.tipBlockNumbers[chain.id] = await blockchainService.getTipBlockNumber();
      this.tipBlockNumbers[chain.id] = 200000;
      this.nextBlockNumbers[chain.id] = await this.indexerUtil.getIndexStartBlockNumber(chain);
    }

    cluster.on('exit', () => {
      this.activeWorkers--;
      if (this.activeWorkers === 0) {
        this.logger.warn('All workers finished, bootstrap complete');
        this.emit('bootstrap:complete');
      }
    });

    cluster.on('message', async (worker, message) => {
      if (message.ready || message.completed) {
        if (!this.checkMemoryUsage()) {
          this.logger.warn('High memory usage detected, pausing task allocation');
          setTimeout(() => this.checkQueueAndAssignWork(worker), 5000);
          return;
        }
        this.checkQueueAndAssignWork(worker);
        return;
      }
    });

    this.logger.warn(`Starting ${this.workerNum} workers`);
    for (let i = 0; i < this.workerNum; i += 1) {
      cluster.fork();
      this.activeWorkers++;
    }
  }

  private checkMemoryUsage(): boolean {
    const memoryUsage = process.memoryUsage();
    const usedMemoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    return usedMemoryPercentage < 90;
  }

  private async checkQueueAndAssignWork(worker: Worker) {
    const counts = await this.indexerServiceFactory.getIndexerQueueJobCounts();
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    this.logger.warn(counts);

    if (total < this.batchSize * this.workerNum) {
      await this.assignWorkToWorker(worker);
    } else {
      this.logger.warn(`Queue has ${total} jobs, waiting for worker ${worker.id}`);
      setTimeout(() => this.checkQueueAndAssignWork(worker), total);
    }
  }

  private async runWorker() {
    this.logger.log(`Indexer Worker ${process.pid} is running`);

    process.on('message', async (msg: IndexerWorkerMessage) => {
      const { chainId, startBlockNumber, endBlockNumber } = msg;
      this.logger.warn(
        `Worker ${process.pid} processing blocks ${startBlockNumber} to ${endBlockNumber}`,
      );
      await this.processBlocks(chainId, startBlockNumber, endBlockNumber);
      process.send!({ completed: true });
    });
  }

  private async assignWorkToWorker(worker: Worker): Promise<void> {
    if (this.currentChainIndex >= this.chains.length) {
      await this.indexerServiceFactory.waitUntilIndexerQueueEmpty();
      worker.kill();
      return;
    }

    const chain = this.chains[this.currentChainIndex];
    const startBlockNumber = this.nextBlockNumbers[chain.id];
    const endBlockNumber = Math.min(
      startBlockNumber + this.batchSize - 1,
      this.tipBlockNumbers[chain.id],
    );

    if (startBlockNumber > this.tipBlockNumbers[chain.id]) {
      this.currentChainIndex++;
      this.assignWorkToWorker(worker);
      return;
    }

    worker.send({ chainId: chain.id, startBlockNumber, endBlockNumber });

    this.nextBlockNumbers[chain.id] = endBlockNumber + 1;
    this.logger.log(
      `Assigned work to worker ${worker.id} for chain ${chain.id}, blocks ${startBlockNumber} to ${endBlockNumber}`,
    );
  }

  private async processBlocks(
    chainId: number,
    startBlockNumber: number,
    endBlockNumber: number,
  ): Promise<void> {
    const indexerService = await this.indexerServiceFactory.getService(chainId);
    await indexerService.indexBlocks(startBlockNumber, endBlockNumber);
  }
}
