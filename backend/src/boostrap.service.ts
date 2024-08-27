import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './core/database/prisma/prisma.service';
import { BlockchainServiceFactory } from './core/blockchain/blockchain.factory';
import { Chain } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { IndexerServiceFactory } from './core/indexer/indexer.factory';
import cluster, { Worker } from 'node:cluster';
import EventEmitter from 'node:events';
import { Env } from './env';
import { IndexerValidator } from './core/indexer/indexer.validator';

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
    public configService: ConfigService<Env>,
    public prismaService: PrismaService,
    public blockchainServiceFactory: BlockchainServiceFactory,
    public indexerServiceFactory: IndexerServiceFactory,
    public indexerValidator: IndexerValidator,
  ) {
    super();
    this.masterProcess = new MasterProcess(this);
    this.workerProcess = new WorkerProcess(this);

    this.bootstrapCompleted = new Promise((resolve) => {
      this.on('bootstrap:complete', () => {
        resolve();
      });
    });
  }

  public async bootstrap(): Promise<void> {
    if (cluster.isPrimary) {
      const now = performance.now();
      this.bootstrapCompleted.then(async () => {
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

  private missingBlocks: { chainId: number; startBlockNumber: number; endBlockNumber: number }[] =
    [];

  constructor(private service: BootstrapService) {
    this.batchSize = this.service.configService.get('INDEXER_BATCH_SIZE')!;
    this.workerNum = this.service.configService.get('INDEXER_WORKER_NUM')!;
  }

  public async run(): Promise<void> {
    this.logger.log(`Indexer Master ${process.pid} is running`);
    await this.initializeChainData();
    await this.validateAndQueueMissingBlocks();
    this.setupClusterEvents();
    this.startWorkers();
  }

  private async validateAndQueueMissingBlocks(): Promise<void> {
    const { valid, result } = await this.service.indexerValidator.validate();

    if (!valid) {
      this.logger.warn('Validation failed. Queueing missing blocks...');
      if (result.blockNumberContinuity.length > 0) {
        for (const row of result.blockNumberContinuity) {
          this.missingBlocks.push({
            chainId: row.chainId,
            startBlockNumber: row.previousBlockNumber,
            endBlockNumber: row.currentBlockNumber,
          });
        }
      }
    } else {
      this.logger.log('Validation passed. No missing blocks found.');
    }
  }

  private async initializeChainData(): Promise<void> {
    await this.service.indexerServiceFactory.cleanLegacyIndexerQueueJobs();
    this.chains = await this.service.prismaService.chain.findMany();
    for (const chain of this.chains) {
      const latestIndexedBlock = await this.service.prismaService.block.findFirst({
        where: { chainId: chain.id },
        orderBy: { number: 'desc' },
      });

      this.nextBlockNumbers[chain.id] = latestIndexedBlock
        ? latestIndexedBlock.number + 1
        : chain.startBlock;

      // const blockchainService = await this.service.blockchainServiceFactory.getService(chain.id);
      // this.tipBlockNumbers[chain.id] = await blockchainService.getTipBlockNumber();
      this.tipBlockNumbers[chain.id] = 20000;
    }
  }

  private setupClusterEvents(): void {
    cluster.on('exit', this.handleWorkerExit.bind(this));
    cluster.on('message', this.handleWorkerMessage.bind(this));
  }

  private async startWorkers(): Promise<void> {
    this.logger.warn(`Starting ${this.workerNum} workers`);
    for (let i = 0; i < this.workerNum; i += 1) {
      cluster.fork();
      this.activeWorkers++;
    }
  }

  private async handleWorkerExit(): Promise<void> {
    this.activeWorkers--;
    if (this.activeWorkers === 0) {
      this.logger.warn('All workers finished, bootstrap complete');
      this.service.emit('bootstrap:complete');
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
    const memoryUsageThreshold = this.service.configService.get('INDEXER_MEMORY_USAGE_THRESHOLD')!;
    const memoryUsage = process.memoryUsage();
    const usedMemoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    if (usedMemoryPercentage > memoryUsageThreshold) {
      if (global.gc) {
        global.gc();
        this.logger.warn('Memory usage is high, running garbage collection');
      } else {
        // Allocate a buffer to trigger garbage collection
        Buffer.alloc((memoryUsage.heapTotal - memoryUsage.heapUsed) / 2);
        this.logger.warn('Memory usage is high, allocating buffer to trigger garbage collection');
      }
      this.batchSize = Math.max(Math.round(this.batchSize / 2) - 1, 1);
      this.logger.warn(`Memory usage is high, reducing batch size to ${this.batchSize}`);
    } else if (this.batchSize < this.service.configService.get('INDEXER_BATCH_SIZE')!) {
      this.batchSize = Math.min(
        Math.round(this.batchSize * 2),
        this.service.configService.get('INDEXER_BATCH_SIZE')!,
      );
      this.logger.warn(`Memory usage is low, increasing batch size to ${this.batchSize}`);
    }

    return usedMemoryPercentage < memoryUsageThreshold;
  }

  private async checkQueueAndAssignWork(worker: Worker): Promise<void> {
    const counts = await this.service.indexerServiceFactory.getIndexerQueueJobCounts();
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

    const defaultBatchSize = this.service.configService.get('INDEXER_BATCH_SIZE')!;
    if (total < defaultBatchSize * this.workerNum) {
      await this.assignWorkToWorker(worker);
    } else {
      this.logger.debug(`Queue has ${total} jobs, waiting for workers to finish`);
      setTimeout(() => this.checkQueueAndAssignWork(worker), 5000);
    }
  }

  private async assignWorkToWorker(worker: Worker): Promise<void> {
    if (this.missingBlocks.length > 0) {
      const { chainId, startBlockNumber, endBlockNumber } = this.missingBlocks.shift()!;
      worker.send({ chainId, startBlockNumber, endBlockNumber });
      this.logger.warn(
        `Assigned missing block to worker ${worker.id} for chain ${chainId}, blocks ${startBlockNumber} to ${endBlockNumber}`,
      );
      return;
    }

    if (this.currentChainIndex >= this.chains.length) {
      await this.service.indexerServiceFactory.waitUntilIndexerQueueEmpty();
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
      // No more blocks to index for this chain but there are missing blocks
      await this.validateAndQueueMissingBlocks();
      if (this.missingBlocks.length > 0) {
        this.assignWorkToWorker(worker);
        return;
      }

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

  constructor(private service: BootstrapService) { }

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
    const indexerService = await this.service.indexerServiceFactory.getService(chainId);
    await indexerService.indexBlocks(startBlockNumber, endBlockNumber);
  }
}
