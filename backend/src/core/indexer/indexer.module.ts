import { Global, Module } from '@nestjs/common';
import { IndexerServiceFactory } from './indexer.factory';
import { BullModule } from '@nestjs/bullmq';
import { INDEXER_BLOCK_QUEUE, IndexerBlockProcessor } from './processors/block.processor';
import {
  INDEXER_TRANSACTION_QUEUE,
  IndexerTransactionProcessor,
} from './processors/transaction.processor';
import { IndexerUtil } from './indexer.utils';
import { createCommonQueueConfig } from './indexer.config';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: INDEXER_BLOCK_QUEUE,
      ...createCommonQueueConfig(),
    }),
    BullModule.registerQueue({
      name: INDEXER_TRANSACTION_QUEUE,
      ...createCommonQueueConfig(),
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
