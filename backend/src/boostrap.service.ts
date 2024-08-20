import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './core/database/prisma/prisma.service';
import { BlockchainServiceFactory } from './core/blockchain/blockchain.factory';
import { Chain } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { IndexerServiceFactory } from './core/indexer/indexer.factory';
import { IndexerUtil } from './core/indexer/indexer.utils';
import cluster from 'node:cluster';
import os from 'node:os';
import EventEmitter from 'node:events';

interface IndexerWorkerMessage {
  chainId: number;
  startBlockNumber: number;
  endBlockNumber: number;
}

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
    this.batchSize = this.configService.get<number>('BOOTSTRAP_BATCH_SIZE', 1000);

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
      this.tipBlockNumbers[chain.id] = 10000;
      this.nextBlockNumbers[chain.id] = await this.indexerUtil.getIndexStartBlockNumber(chain);
    }

    cluster.on('exit', (worker) => {
      this.logger.log(`Worker ${worker.process.pid} finished`);
      this.activeWorkers--;
      this.startNextWorker();
    });

    for (let i = 0; i < os.cpus().length; i += 1) {
      this.startNextWorker();
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
      process.exit(0);
    });
  }

  private async startNextWorker(): Promise<void> {
    if (this.currentChainIndex >= this.chains.length) {
      if (this.activeWorkers === 0) {
        this.emit('bootstrap:complete');
      }
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
      this.startNextWorker();
      return;
    }

    const worker = cluster.fork();
    this.activeWorkers++;

    cluster.on('message', (sender, message) => {
      if (message.ready && worker.process.pid === sender.process.pid) {
        worker.send({ chainId: chain.id, startBlockNumber, endBlockNumber });
      }
    });

    this.nextBlockNumbers[chain.id] = endBlockNumber + 1;
    this.logger.log(
      `Started worker for chain ${chain.id}, blocks ${startBlockNumber} to ${endBlockNumber}`,
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
