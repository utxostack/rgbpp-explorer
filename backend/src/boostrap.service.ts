import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './core/database/prisma/prisma.service';
import { BlockchainServiceFactory } from './core/blockchain/blockchain.factory';
import { Chain } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { IndexerServiceFactory } from './core/indexer/indexer.factory';
import { IndexerUtil } from './core/indexer/indexer.utils';
import cluster, { Worker } from 'node:cluster';
import os from 'node:os';
import EventEmitter from 'node:events';

interface IndexerWorkerMessage {
  chainId: number;
  startBlockNumber: number;
  endBlockNumber: number;
}

// const WORKER_NUM = os.cpus().length;
const WORKER_NUM = 1;

@Injectable()
export class BootstrapService extends EventEmitter {
  private readonly logger = new Logger(BootstrapService.name);
  private readonly batchSize: number;

  private chains: Chain[] = [];
  private currentChainIndex = 0;
  private tipBlockNumbers: { [chainId: number]: number } = {};
  private nextBlockNumbers: { [chainId: number]: number } = {};
  private activeWorkers = 0;

  public bootstraped: Promise<void>;

  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
    private blockchainServiceFactory: BlockchainServiceFactory,
    private indexerServiceFactory: IndexerServiceFactory,
    private indexerUtil: IndexerUtil,
  ) {
    super();
    this.batchSize = this.configService.get<number>('BOOTSTRAP_BATCH_SIZE', 100);

    this.bootstraped = new Promise((resolve) => {
      this.on('bootstrap:complete', () => {
        const checkQueue = async () => {
          if (await this.indexerServiceFactory.isIndexerQueueEmpty()) {
            resolve();
          } else {
            setTimeout(checkQueue, 1000);
          }
        };
        checkQueue();
      });
    });
  }

  public async bootstrap(): Promise<void> {
    if (cluster.isPrimary) {
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
      const blockchainService = await this.blockchainServiceFactory.getService(chain.id);
      // this.tipBlockNumbers[chain.id] = await blockchainService.getTipBlockNumber();
      this.tipBlockNumbers[chain.id] = 500000;
      this.nextBlockNumbers[chain.id] = await this.indexerUtil.getIndexStartBlockNumber(chain);
    }

    cluster.on('exit', (worker) => {
      this.logger.log(`Worker ${worker.process.pid} finished`);
      this.activeWorkers--;
      if (this.activeWorkers === 0 && this.currentChainIndex >= this.chains.length) {
        this.emit('bootstrap:complete');
      }
    });

    cluster.on('message', async (worker, message) => {
      if (message.ready || message.completed) {
        // Worker is ready or completed work, try to assign more work to it
        const checkQueueAndAssignWork = async () => {
          const counts = await this.indexerServiceFactory.getIndexerQueueJobCounts();
          const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
          this.logger.error(counts);

          // Check every second if the queue jobs are less than the number of workers * batch size
          // So that we can assign work to the worker and avoid overloading the queue
          // (too many unprocessed jobs when causing js heap out of memory)
          if (total < this.batchSize * WORKER_NUM) {
            this.logger.log(`Queue has ${total} jobs, assigning work to worker ${worker.id}`);
            await this.assignWorkToWorker(worker);
          } else {
            this.logger.log(`Queue has ${total} jobs, waiting for worker ${worker.id}`);
            setTimeout(checkQueueAndAssignWork, total);
          }
        };
        checkQueueAndAssignWork();
        return;
      }
    });

    for (let i = 0; i < WORKER_NUM; i += 1) {
      cluster.fork();
      this.activeWorkers++;
    }
  }

  private async runWorker() {
    this.logger.log(`Indexer Worker ${process.pid} is running`);

    process.on('message', async (msg: IndexerWorkerMessage) => {
      const { chainId, startBlockNumber, endBlockNumber } = msg;
      this.logger.log(
        `Worker ${process.pid} processing blocks ${startBlockNumber} to ${endBlockNumber}`,
      );
      await this.processBlocks(chainId, startBlockNumber, endBlockNumber);
      process.send!({ completed: true });
    });
  }

  private async assignWorkToWorker(worker: Worker): Promise<void> {
    if (this.currentChainIndex >= this.chains.length) {
      worker.disconnect();
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
