import { Global, Module } from '@nestjs/common';
import { IndexerServiceFactory } from './indexer.factory';
import { BullModule } from '@nestjs/bullmq';
import { INDEXER_ASSETS_QUEUE, IndexerAssetsProcessor } from './processor/assets.processor';
import { IndexerQueueService } from './indexer.queue';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: INDEXER_ASSETS_QUEUE,
    }),
  ],
  providers: [IndexerServiceFactory, IndexerQueueService, IndexerAssetsProcessor],
  exports: [IndexerServiceFactory, IndexerQueueService],
})
export class IndexerModule { }
