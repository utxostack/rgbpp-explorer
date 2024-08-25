import { Global, Module } from '@nestjs/common';
import { IndexerServiceFactory } from './indexer.factory';
import { BullModule } from '@nestjs/bullmq';
import { IndexerBlockProcessor } from './processors/block.processor';
import { IndexerTransactionProcessor } from './processors/transaction.processor';
import { IndexerUtilService } from './indexer.utils';
import { createCommonQueueConfig } from './indexer.config';
import { IndexerQueueService, QUEUES } from './indexer.queue';
import { IndexerOutputProcessor } from './processors/output.processor';
import { IndexerLockScriptProcessor } from './processors/lock.processor';
import { IndexerTypeScriptProcessor } from './processors/type.processor';

@Global()
@Module({
  imports: [
    ...QUEUES.map((queueType) => {
      return BullModule.registerQueue({
        name: queueType,
        ...createCommonQueueConfig(),
      });
    }),
  ],
  providers: [
    IndexerUtilService,
    IndexerServiceFactory,
    IndexerQueueService,
    IndexerBlockProcessor,
    IndexerTransactionProcessor,
    IndexerOutputProcessor,
    IndexerLockScriptProcessor,
    IndexerTypeScriptProcessor,
  ],
  exports: [IndexerServiceFactory, IndexerUtilService],
})
export class IndexerModule { }
