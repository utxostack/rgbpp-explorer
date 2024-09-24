import { forwardRef, Global, Module } from '@nestjs/common';
import { IndexerServiceFactory } from './indexer.factory';
import { BullModule } from '@nestjs/bullmq';
import { INDEXER_ASSETS_QUEUE, IndexerAssetsProcessor } from './processor/assets.processor';
import { IndexerQueueService } from './indexer.queue';
import { INDEXER_BLOCK_QUEUE, IndexerBlockProcessor } from './processor/block.processor';
import { IndexerAssetsService } from './service/assets.service';
import { CoreModule } from '../core.module';
import { INDEXER_TYPE_QUEUE, IndexerTypeProcessor } from './processor/type.processor';
import { INDEXER_LOCK_QUEUE, IndexerLockProcessor } from './processor/lock.processor';
import { DefaultJobOptions } from 'bullmq';

const commonAttemptsConfig: Pick<DefaultJobOptions, 'attempts' | 'backoff'> = {
  attempts: 10,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
};

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: INDEXER_ASSETS_QUEUE,
      ...commonAttemptsConfig,
    }),
    BullModule.registerQueue({
      name: INDEXER_BLOCK_QUEUE,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
        ...commonAttemptsConfig,
      },
    }),
    BullModule.registerQueue({
      name: INDEXER_LOCK_QUEUE,
      ...commonAttemptsConfig,
    }),
    BullModule.registerQueue({
      name: INDEXER_TYPE_QUEUE,
      ...commonAttemptsConfig,
    }),
    forwardRef(() => CoreModule),
  ],
  providers: [
    IndexerServiceFactory,
    IndexerAssetsService,
    IndexerQueueService,
    IndexerAssetsProcessor,
    IndexerBlockProcessor,
    IndexerLockProcessor,
    IndexerTypeProcessor,
  ],
  exports: [IndexerServiceFactory, IndexerQueueService],
})
export class IndexerModule { }
