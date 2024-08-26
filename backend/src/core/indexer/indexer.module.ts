import { Global, Module } from '@nestjs/common';
import { IndexerServiceFactory } from './indexer.factory';
import { BullModule } from '@nestjs/bullmq';
import { INDEXER_PROCESSOR_QUEUE, IndexerProcessor } from './indexer.processor';
import { BlockProcessor } from './processor/block.processor';
import { TransactionProcessor } from './processor/transaction.processor';
import { LockScriptProcessor } from './processor/lock.processor';
import { TypeScriptProcessor } from './processor/type.processor';
import { OutputProcessor } from './processor/output.processor';
import { IndexerValidator } from './indexer.validator';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: INDEXER_PROCESSOR_QUEUE,
      defaultJobOptions: {
        attempts: 10,
        backoff: {
          type: 'fixed',
          delay: 5000,
        },
      },
    }),
  ],
  providers: [
    IndexerServiceFactory,
    IndexerValidator,
    IndexerProcessor,
    BlockProcessor,
    TransactionProcessor,
    OutputProcessor,
    LockScriptProcessor,
    TypeScriptProcessor,
  ],
  exports: [IndexerServiceFactory],
})
export class IndexerModule { }
