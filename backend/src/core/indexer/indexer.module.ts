import { Global, Module } from '@nestjs/common';
import { IndexerServiceFactory } from './indexer.factory';
import { BullModule } from '@nestjs/bullmq';
import { INDEXER_BLOCK_QUEUE, IndexerBlockProcessor } from './processors/block.processor';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: INDEXER_BLOCK_QUEUE,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      },
    }),
  ],
  providers: [IndexerServiceFactory, IndexerBlockProcessor],
  exports: [IndexerServiceFactory],
})
export class IndexerModule { }
