import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { IndexerService } from './indexer.service';
import { BlockchainServiceFactory } from '../blockchain/blockchain.factory';
import { InjectQueue } from '@nestjs/bullmq';
import { INDEXER_PROCESSOR_QUEUE } from './indexer.processor';
import { Queue } from 'bullmq';
import { IndexerValidator } from './indexer.validator';

export class IndexerServiceFactoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IndexerServiceFactoryError';
  }
}

type JobCounts = { [key: string]: number };

@Injectable()
export class IndexerServiceFactory implements OnModuleDestroy {
  private logger = new Logger(IndexerServiceFactory.name);
  private services: Map<number, IndexerService> = new Map();

  constructor(
    private prismaService: PrismaService,
    private blockchainServiceFactory: BlockchainServiceFactory,
    private indexerValidator: IndexerValidator,
    @InjectQueue(INDEXER_PROCESSOR_QUEUE) private indexerQueue: Queue,
  ) { }

  public async onModuleDestroy() {
    for (const service of this.services.values()) {
      await service.close();
    }
  }

  public async getService(chainId: number): Promise<IndexerService> {
    const chain = await this.prismaService.chain.findUnique({
      where: { id: chainId },
    });
    if (!chain) {
      throw new IndexerServiceFactoryError(`Chain with ID ${chainId} not found`);
    }
    if (!this.services.has(chain.id)) {
      const blockchainService = await this.blockchainServiceFactory.getService(chain.id);
      const service = new IndexerService(chain, blockchainService, this.indexerQueue);
      this.services.set(chain.id, service);
    }
    return this.services.get(chain.id)!;
  }

  public async getIndexerQueueJobCounts(): Promise<JobCounts> {
    const jobCounts = await this.indexerQueue.getJobCounts();
    this.logger.warn(`Indexer queue job counts: ${JSON.stringify(jobCounts)}`);
    return Object.entries(jobCounts).reduce((acc, [key, value]) => {
      if (key === 'completed' || key === 'failed') {
        return acc;
      }
      return { ...acc, [key]: value };
    }, {} as JobCounts);
  }

  public async processLegacyIndexerQueueJobs() {
    const activeJobs = await this.indexerQueue.getActive();
    for (const job of activeJobs) {
      await job.moveToDelayed(Date.now());
    }
  }

  public async waitUntilIndexerQueueEmpty() {
    return new Promise<void>((resolve) => {
      const check = async () => {
        const counts = await this.getIndexerQueueJobCounts();
        const isQueueEmpty = Object.values(counts).every((count) => count === 0);
        if (isQueueEmpty) {
          resolve();
        } else {
          setTimeout(check, 2000);
        }
      };
      check();
    });
  }

  public async validateIndexerData() {
    const valid = await this.indexerValidator.validate();
    return valid;
  }
}
