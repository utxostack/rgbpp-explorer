import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './core/database/prisma/prisma.service';
import { BlockchainServiceFactory } from './core/blockchain/blockchain.factory';
import { Chain } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { IndexerServiceFactory } from './core/indexer/indexer.factory';
import cluster, { Worker } from 'node:cluster';
import EventEmitter from 'node:events';
import { Env } from './env';
import { IndexerValidationResult, IndexerValidator } from './core/indexer/indexer.validator';

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

  private missingBlocksMap = new Map<number, IndexerWorkerMessage[]>();

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
      const blockNumberMap = this.collectMissingBlocks(result);
      blockNumberMap.forEach((blockNumbers, chainId) => {
        const mergedIntervals = this.mergeIntervals(Array.from(blockNumbers));
        this.missingBlocksMap.set(chainId, mergedIntervals);
      });
    } else {
      this.logger.log('Validation passed. No missing blocks found.');
    }
  }

  private collectMissingBlocks(result: IndexerValidationResult): Map<number, Set<number>> {
    const {
      blockNumberContinuity,
      blockTransactionCounts,
      transactionInputCounts,
      transactionOutputCounts,
    } = result;
    const blockNumberMap = new Map<number, Set<number>>();
    const addBlockToMap = (chainId: number, blockNumber: number) => {
      const set = blockNumberMap.get(chainId) || new Set<number>();
      set.add(blockNumber);
      blockNumberMap.set(chainId, set);
    };
    for (const row of blockNumberContinuity) {
      for (let i = row.previousBlockNumber; i <= row.currentBlockNumber; i++) {
        addBlockToMap(row.chainId, i);
      }
    }
    const otherResults = [
      ...blockTransactionCounts,
      ...transactionInputCounts,
      ...transactionOutputCounts,
    ];
    for (const row of otherResults) {
      addBlockToMap(row.chainId, row.blockNumber);
    }
    return blockNumberMap;
  }

  private mergeIntervals(blockNumbers: number[]): IndexerWorkerMessage[] {
    const sortedBlockNumbers = Array.from(blockNumbers).sort((a, b) => a - b);

    const mergedIntervals: IndexerWorkerMessage[] = [];
    let start = sortedBlockNumbers[0];
    let end = sortedBlockNumbers[0];

    for (let i = 1; i < sortedBlockNumbers.length; i++) {
      if (sortedBlockNumbers[i] === end + 1) {
        end = sortedBlockNumbers[i];
      } else {
        mergedIntervals.push({
          chainId: this.chains[this.currentChainIndex].id,
          startBlockNumber: start,
          endBlockNumber: end,
        });
        start = sortedBlockNumbers[i];
        end = sortedBlockNumbers[i];
      }
    }

    mergedIntervals.push({
      chainId: this.chains[this.currentChainIndex].id,
      startBlockNumber: start,
      endBlockNumber: end,
    });

    return mergedIntervals;
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

      const blockchainService = await this.service.blockchainServiceFactory.getService(chain.id);
      this.tipBlockNumbers[chain.id] = await blockchainService.getTipBlockNumber();
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
      } else {
        // Allocate a buffer to trigger garbage collection
        Buffer.alloc((memoryUsage.heapTotal - memoryUsage.heapUsed) / 2);
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
    if (total < defaultBatchSize * this.workerNum * 10) {
      await this.assignWorkToWorker(worker);
    } else {
      this.logger.debug(`Queue has ${total} jobs, waiting for workers to finish`);
      setTimeout(() => this.checkQueueAndAssignWork(worker), 1000);
    }
  }

  private async assignWorkToWorker(worker: Worker): Promise<void> {
    const missingBlocks = this.missingBlocksMap.get(this.chains[this.currentChainIndex].id) ?? [];
    if (missingBlocks.length > 0) {
      const { chainId, startBlockNumber, endBlockNumber } = missingBlocks.shift()!;
      this.missingBlocksMap.set(chainId, missingBlocks);
      worker.send({ chainId, startBlockNumber, endBlockNumber });
      this.logger.warn(
        `Assigned missing block work to worker ${worker.id} for chain ${chainId}, blocks ${startBlockNumber} to ${endBlockNumber}`,
      );
      return;
    }

    const chain = this.chains[this.currentChainIndex];
    if (!chain) {
      await this.service.indexerServiceFactory.waitUntilIndexerQueueEmpty();
      worker.kill();
      return;
    }

    const startBlockNumber = this.nextBlockNumbers[chain.id];
    const endBlockNumber = Math.min(
      startBlockNumber + this.batchSize - 1,
      this.tipBlockNumbers[chain.id],
    );

    const jobCounts = await this.service.indexerServiceFactory.getIndexerQueueJobCounts();
    if (
      startBlockNumber > this.tipBlockNumbers[chain.id] ||
      // If there are more delayed jobs than active jobs, meaning the queue is stuck
      (jobCounts['active'] / jobCounts['delayed'] < 0.2 &&
        (this.missingBlocksMap.get(chain.id) ?? []).length === 0)
    ) {
      await this.validateAndQueueMissingBlocks();
      const missingBlocks = this.missingBlocksMap.get(chain.id) ?? [];
      if (missingBlocks.length > 0) {
        this.assignWorkToWorker(worker);
        return;
      }
    }

    if (startBlockNumber > this.tipBlockNumbers[chain.id]) {
      this.currentChainIndex++;
      this.assignWorkToWorker(worker);
      return;
    }

    worker.send({ chainId: chain.id, startBlockNumber, endBlockNumber });

    this.nextBlockNumbers[chain.id] = endBlockNumber + 1;
    this.logger.warn(
      `Assigned work to worker ${worker.id} for chain ${chain.id}, blocks ${startBlockNumber} to ${endBlockNumber}`,
    );
  }
}

class WorkerProcess {
  private readonly logger = new Logger(WorkerProcess.name);

  constructor(private service: BootstrapService) {}

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
