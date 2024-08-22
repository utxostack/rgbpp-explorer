import { Global, Module } from '@nestjs/common';
import { IndexerServiceFactory } from './indexer.factory';
import { BullModule } from '@nestjs/bullmq';
import { INDEXER_BLOCK_QUEUE, IndexerBlockProcessor } from './processors/block.processor';
import {
  INDEXER_TRANSACTION_QUEUE,
  IndexerTransactionProcessor,
} from './processors/transaction.processor';
import { IndexerUtil } from './indexer.utils';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: INDEXER_BLOCK_QUEUE,
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
      },
    }),
    BullModule.registerQueue({
      name: INDEXER_TRANSACTION_QUEUE,
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
      },
    }),
  ],
  providers: [
    IndexerUtil,
    IndexerServiceFactory,
    IndexerBlockProcessor,
    IndexerTransactionProcessor,
  ],
  exports: [IndexerServiceFactory, IndexerUtil],
})
export class IndexerModule {}
