import { Injectable, OnModuleDestroy } from '@nestjs/common';
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
  private services: Map<number, IndexerService> = new Map();

  constructor(
    private prismaService: PrismaService,
    private blockchainServiceFactory: BlockchainServiceFactory,
    @InjectQueue(INDEXER_BLOCK_QUEUE) private indexerBlockQueue: Queue,
    @InjectQueue(INDEXER_TRANSACTION_QUEUE) private indexerTransactionQueue: Queue,
    @InjectSentry() private sentryService: SentryService,
  ) {}

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
      this.services.set(chainId, new IndexerService(chain, blockchainService, this.indexerBlockQueue));
    }
    return this.services.get(chainId)!;
  }

  public async isIndexerQueueEmpty(): Promise<boolean> {
    const blockQueueCount = await this.indexerBlockQueue.getJobCounts();
    const transactionQueueCount = await this.indexerTransactionQueue.getJobCounts();
    const waiting = blockQueueCount.waiting + transactionQueueCount.waiting;
    const active = blockQueueCount.active + transactionQueueCount.active;

    return waiting === 0 && active === 0;
  }
}
