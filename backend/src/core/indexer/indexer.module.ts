import { Global, Module } from '@nestjs/common';
import { IndexerServiceFactory } from './indexer.factory';
import { BullModule } from '@nestjs/bullmq';
import { INDEXER_ASSETS_QUEUE, IndexerAssetsProcessor } from './processor/assets.processor';
import { IndexerQueueService } from './indexer.queue';
import { INDEXER_BLOCK_QUEUE, IndexerBlockProcessor } from './processor/block.processor';
import { IndexerAssetsService } from './service/assets.service';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: INDEXER_ASSETS_QUEUE,
    }),
    BullModule.registerQueue({
      name: INDEXER_BLOCK_QUEUE,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      }
    }),
  ],
  providers: [
    IndexerServiceFactory,
    IndexerAssetsService,
    IndexerQueueService,
    IndexerAssetsProcessor,
    IndexerBlockProcessor,
  ],
  exports: [IndexerServiceFactory, IndexerQueueService],
})
export class IndexerModule { }
