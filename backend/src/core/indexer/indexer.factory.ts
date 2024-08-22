import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { PrismaService } from '../database/prisma/prisma.service';
import { IndexerService } from './indexer.service';
import { BlockchainServiceFactory } from '../blockchain/blockchain.factory';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { INDEXER_BLOCK_QUEUE } from './processors/block.processor';
import { INDEXER_TRANSACTION_QUEUE } from './processors/transaction.processor';

export class IndexerServiceFactoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BlockchainServiceFactoryError';
  }
}

@Injectable()
export class IndexerServiceFactory implements OnModuleDestroy {
  private logger = new Logger(IndexerServiceFactory.name);
  private services: Map<number, IndexerService> = new Map();

  constructor(
    private prismaService: PrismaService,
    private blockchainServiceFactory: BlockchainServiceFactory,
    @InjectQueue(INDEXER_BLOCK_QUEUE) private indexerBlockQueue: Queue,
    @InjectQueue(INDEXER_TRANSACTION_QUEUE) private indexerTransactionQueue: Queue,
    @InjectSentry() private sentryService: SentryService,
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
      this.services.set(
        chainId,
        new IndexerService(chain, blockchainService, this.indexerBlockQueue),
      );
    }
    return this.services.get(chainId)!;
  }

  public async cleanIndexerQueueJobs() {
    const blockQueueCounts = await this.indexerBlockQueue.getJobCounts();
    const totalBlockJobs = Object.values(blockQueueCounts).reduce((sum, count) => sum + count, 0);
    if (totalBlockJobs > 0) {
      this.logger.log(`Cleaning ${totalBlockJobs} block jobs from the indexer queue`);
      await this.indexerBlockQueue.clean(0, totalBlockJobs);
    }

    const transactionQueueCounts = await this.indexerTransactionQueue.getJobCounts();
    const totalTransactionJobs = Object.values(transactionQueueCounts).reduce(
      (sum, count) => sum + count,
      0,
    );
    if (totalTransactionJobs > 0) {
      this.logger.log(`Cleaning ${totalTransactionJobs} transaction jobs from the indexer queue`);
      await this.indexerTransactionQueue.clean(0, totalTransactionJobs);
    }
  }

  public async getIndexerQueueJobCounts() {
    const blockQueueCounts = await this.indexerBlockQueue.getJobCounts();
    const transactionQueueCounts = await this.indexerTransactionQueue.getJobCounts();

    const counts = [blockQueueCounts, transactionQueueCounts].reduce(
      (sum, counts) => {
        const keys = Object.keys(counts);
        keys.forEach((key) => {
          if (sum[key] === undefined) {
            sum[key] = counts[key];
          } else {
            sum[key] += counts[key];
          }
        });
        return sum;
      },
      {} as { [key: string]: number },
    );

    return counts;
  }

  public async isIndexerQueueEmpty(): Promise<boolean> {
    const counts = await this.getIndexerQueueJobCounts();
    this.logger.error(counts);
    return Object.values(counts).every((count) => count === 0);
  }

  public async waitUntilIndexerQueueEmpty() {
    await new Promise((resolve) => {
      const check = async () => {
        const isQueueEmpty = await this.isIndexerQueueEmpty();
        if (isQueueEmpty) {
          resolve(undefined);
        } else {
          setTimeout(check, 1000);
        }
      };
      check();
    })
  }
}
