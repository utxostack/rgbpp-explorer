import { forwardRef, Global, Module } from '@nestjs/common';
import { IndexerServiceFactory } from './indexer.factory';
import { BullModule } from '@nestjs/bullmq';
import { INDEXER_ASSETS_QUEUE, IndexerAssetsProcessor } from './processor/assets.processor';
import { IndexerQueueService } from './indexer.queue';
import {
  INDEXER_BLOCK_ASSETS_QUEUE,
  IndexerBlockAssetsProcessor,
} from './processor/block-assets.processor';
import { IndexerAssetsService } from './service/assets.service';
import { CoreModule } from '../core.module';
import { INDEXER_TYPE_QUEUE, IndexerTypeProcessor } from './processor/type.processor';
import { INDEXER_LOCK_QUEUE, IndexerLockProcessor } from './processor/lock.processor';
import { DefaultJobOptions } from 'bullmq';
import { INDEXER_BLOCK_QUEUE, IndexerBlockProcessor } from './processor/block.processor';
import {
  INDEXER_TRANSACTION_QUEUE,
  IndexerTransactionProcessor,
} from './processor/transaction.processor';
import { IndexerHealthIndicator } from './indexer.health';

const defaultJobOptions: DefaultJobOptions = {
  attempts: 10,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
  removeOnComplete: true,
  removeOnFail: true,
};

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: INDEXER_ASSETS_QUEUE,
      defaultJobOptions,
    }),
    BullModule.registerQueue({
      name: INDEXER_BLOCK_ASSETS_QUEUE,
      defaultJobOptions,
    }),
    BullModule.registerQueue({
      name: INDEXER_BLOCK_QUEUE,
      defaultJobOptions,
    }),
    BullModule.registerQueue({
      name: INDEXER_TRANSACTION_QUEUE,
      defaultJobOptions,
    }),
    BullModule.registerQueue({
      name: INDEXER_LOCK_QUEUE,
      defaultJobOptions,
    }),
    BullModule.registerQueue({
      name: INDEXER_TYPE_QUEUE,
      defaultJobOptions,
    }),
    forwardRef(() => CoreModule),
  ],
  providers: [
    IndexerServiceFactory,
    IndexerAssetsService,
    IndexerQueueService,
    IndexerAssetsProcessor,
    IndexerBlockAssetsProcessor,
    IndexerLockProcessor,
    IndexerTypeProcessor,
    IndexerBlockProcessor,
    IndexerTransactionProcessor,
    IndexerHealthIndicator,
  ],
  exports: [IndexerServiceFactory, IndexerQueueService, IndexerHealthIndicator],
})
export class IndexerModule {}
