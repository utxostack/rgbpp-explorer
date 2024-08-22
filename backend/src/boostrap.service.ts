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

type BlockNumberMap = { [chainId: number]: number };

interface IndexerWorkerMessage {
  chainId: number;
  startBlockNumber: number;
  endBlockNumber: number;
}

@Injectable()
export class BootstrapService extends EventEmitter {
  private readonly logger = new Logger(BootstrapService.name);
  private readonly masterProcess: MasterProcess;
  private readonly workerProcess: WorkerProcess;

  public bootstrapCompleted: Promise<void>;

  constructor(
    private configService: ConfigService<Env>,
    private prismaService: PrismaService,
    private blockchainServiceFactory: BlockchainServiceFactory,
    private indexerServiceFactory: IndexerServiceFactory,
    private indexerUtil: IndexerUtil,
  ) {
    super();
    this.masterProcess = new MasterProcess(
      this,
      configService,
      prismaService,
      blockchainServiceFactory,
      indexerServiceFactory,
      indexerUtil,
    );
    this.workerProcess = new WorkerProcess(this, indexerServiceFactory);

    this.bootstrapCompleted = new Promise((resolve) => {
      this.on('bootstrap:complete', () => {
        resolve();
      });
    });
  }

  public async bootstrap(): Promise<void> {
    if (cluster.isPrimary) {
      const now = performance.now();
      this.bootstrapCompleted.then(() => {
        this.logger.warn(`Bootstrap complete in ${performance.now() - now}ms`);
      });
      await this.masterProcess.run();
    } else {
      await this.workerProcess.run();
    }
  }

  public workerReady(): void {
    this.workerProcess.notifyReady();
  }
}

class MasterProcess {
  private readonly logger = new Logger(MasterProcess.name);
  private readonly workerNum: number;
  private batchSize: number;

  private chains: Chain[] = [];
  private currentChainIndex = 0;
  private tipBlockNumbers: BlockNumberMap = {};
  private nextBlockNumbers: BlockNumberMap = {};
  private activeWorkers = 0;

  constructor(
    private bootstrapService: BootstrapService,
    private configService: ConfigService<Env>,
    private prismaService: PrismaService,
    private blockchainServiceFactory: BlockchainServiceFactory,
    private indexerServiceFactory: IndexerServiceFactory,
    private indexerUtil: IndexerUtil,
  ) {
    this.batchSize = this.configService.get('INDEXER_BATCH_SIZE')!;
    this.workerNum = this.configService.get('INDEXER_WORKER_NUM')!;
  }

  public async run(): Promise<void> {
    this.logger.log(`Indexer Master ${process.pid} is running`);
    await this.initializeChainData();
    this.setupClusterEvents();
    this.startWorkers();
  }

  private async initializeChainData(): Promise<void> {
    await this.indexerServiceFactory.processLegacyIndexerQueueJobs();
    this.chains = await this.prismaService.chain.findMany();
    for (const chain of this.chains) {
      const blockchainService = await this.blockchainServiceFactory.getService(chain.id);
      this.tipBlockNumbers[chain.id] = await blockchainService.getTipBlockNumber();
      this.nextBlockNumbers[chain.id] = await this.indexerUtil.getIndexStartBlockNumber(chain);
    }
  }

  private setupClusterEvents(): void {
    cluster.on('exit', this.handleWorkerExit.bind(this));
    cluster.on('message', this.handleWorkerMessage.bind(this));
  }

  private startWorkers(): void {
    this.logger.warn(`Starting ${this.workerNum} workers`);
    for (let i = 0; i < this.workerNum; i += 1) {
      cluster.fork();
      this.activeWorkers++;
    }
  }

  private handleWorkerExit(): void {
    this.activeWorkers--;
    if (this.activeWorkers === 0) {
      this.logger.warn('All workers finished, bootstrap complete');
      this.bootstrapService.emit('bootstrap:complete');
    }
  }

  private async handleWorkerMessage(worker: Worker, message: any): Promise<void> {
    if (message.ready || message.completed) {
      if (message.completed) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (!this.checkMemoryUsage()) {
        setTimeout(() => this.checkQueueAndAssignWork(worker), 10000);
        return;
      }
      this.checkQueueAndAssignWork(worker);
    }
  }

  private checkMemoryUsage(): boolean {
    const memoryUsageThreshold = this.configService.get('INDEXER_MEMORY_USAGE_THRESHOLD')!;
    const memoryUsage = process.memoryUsage();
    const usedMemoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    this.logger.error(`Memory usage: ${usedMemoryPercentage.toFixed(2)}%`);

    if (usedMemoryPercentage > memoryUsageThreshold) {
      if (global.gc) {
        this.logger.warn('Memory usage is high, running garbage collection');
        global.gc();
      }
      this.batchSize = Math.max(Math.round(this.batchSize / 2) - 1, 1);
      this.logger.warn(`Memory usage is high, reducing batch size to ${this.batchSize}`);
    } else if (this.batchSize < this.configService.get('INDEXER_BATCH_SIZE')!) {
      this.batchSize = Math.min(
        Math.round(this.batchSize * 2),
        this.configService.get('INDEXER_BATCH_SIZE')!,
      );
      this.logger.warn(`Memory usage is low, increasing batch size to ${this.batchSize}`);
    }

    return usedMemoryPercentage < memoryUsageThreshold;
  }

  private async checkQueueAndAssignWork(worker: Worker): Promise<void> {
    const counts = await this.indexerServiceFactory.getIndexerQueueJobCounts();
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

    if (total < this.batchSize * this.workerNum) {
      await this.assignWorkToWorker(worker);
    } else {
      this.logger.warn(`Queue has ${total} jobs, waiting for worker ${worker.id}`);
      setTimeout(() => this.checkQueueAndAssignWork(worker), total);
    }
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
}

class WorkerProcess {
  private readonly logger = new Logger(WorkerProcess.name);

  constructor(
    private bootstrapService: BootstrapService,
    private indexerServiceFactory: IndexerServiceFactory,
  ) {}

  public async run(): Promise<void> {
    this.logger.log(`Indexer Worker ${process.pid} is running`);
    process.on('message', this.handleMessage.bind(this));
  }

  public notifyReady(): void {
    if (cluster.isPrimary) return;
    this.logger.log(`Indexer Worker ${process.pid} is ready`);
    process.send!({ ready: true });
  }

  private async handleMessage(msg: IndexerWorkerMessage): Promise<void> {
    const { chainId, startBlockNumber, endBlockNumber } = msg;
    this.logger.warn(
      `Worker ${process.pid} processing blocks ${startBlockNumber} to ${endBlockNumber}`,
    );
    await this.processBlocks(chainId, startBlockNumber, endBlockNumber);
    process.send!({ completed: true });
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
