import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { PrismaService } from '../database/prisma/prisma.service';
import { IndexerService } from './indexer.service';
import { BlockchainServiceFactory } from '../blockchain/blockchain.factory';
import { IndexerQueueService } from './indexer.queue';

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
    private queueService: IndexerQueueService,
    @InjectSentry() private sentryService: SentryService,
  ) {}

  public async onModuleDestroy() {
    for (const service of this.services.values()) {
      await service.close();
    }
  }

  public async getService(chainId: number): Promise<IndexerService> {
    const chain = await this.getChain(chainId);
    if (!this.services.has(chain.id)) {
      this.services.set(chain.id, await this.createIndexerService(chain));
    }
    return this.services.get(chain.id)!;
  }

  public async processLegacyIndexerQueueJobs() {
    await this.queueService.delayActiveJobs();
  }

  public async getIndexerQueueJobCounts(): Promise<JobCounts> {
    const counts = await this.queueService.getJobCounts();
    // FIXME: Remove this log statement after debugging
    this.logger.warn(`Indexer queue counts: ${JSON.stringify(counts, null, 2)}`);
    return counts;
  }

  public async waitUntilIndexerQueueEmpty() {
    await this.pollQueueUntilEmpty();
  }

  private async getChain(chainId: number) {
    const chain = await this.prismaService.chain.findUnique({
      where: { id: chainId },
    });
    if (!chain) {
      throw new IndexerServiceFactoryError(`Chain with ID ${chainId} not found`);
    }
    return chain;
  }

  private async createIndexerService(chain: any): Promise<IndexerService> {
    const blockchainService = await this.blockchainServiceFactory.getService(chain.id);
    return new IndexerService(chain, blockchainService, this.queueService.getBlockQueue());
  }

  private async pollQueueUntilEmpty() {
    return new Promise<void>((resolve) => {
      const check = async () => {
        const counts = await this.getIndexerQueueJobCounts();
        const isQueueEmpty = Object.values(counts).every((count) => count === 0);
        if (isQueueEmpty) {
          resolve();
        } else {
          setTimeout(check, 1000);
        }
      };
      check();
    });
  }
}
