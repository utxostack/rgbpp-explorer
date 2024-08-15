import { Global, Module } from '@nestjs/common';
import { IndexerServiceFactory } from './indexer.factory';
import { BullModule } from '@nestjs/bullmq';
import { INDEXER_QUEUE_NAME, IndexerProcessor } from './indexer.processor';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: INDEXER_QUEUE_NAME,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      },
    }),
  ],
  providers: [IndexerServiceFactory, IndexerProcessor],
  exports: [IndexerServiceFactory],
})
export class IndexerModule {}
