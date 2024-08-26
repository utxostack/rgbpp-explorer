import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, QueueEvents } from 'bullmq';
import EventEmitter from 'node:events';

export enum QueueType {
  Block = 'indexer-block',
  Transaction = 'indexer-transaction',
  Output = 'indexer-output',
  LockScript = 'indexer-lock-script',
  TypeScript = 'indexer-type-script',
}

export const QUEUES = [
  QueueType.Block,
  QueueType.Transaction,
  QueueType.Output,
  QueueType.LockScript,
  QueueType.TypeScript,
];

EventEmitter.defaultMaxListeners = 0;

export enum QueueJobPriority {
  LockScript = 1,
  TypeScript = 1,
  Output = 2,
  Transaction = 3,
  Block = 4,
}

interface GetJobCountsOpts {
  exclude?: string[];
}

@Injectable()
export class IndexerQueueService {
  private logger = new Logger(IndexerQueueService.name);
  private IndexerQueues: Queue[];
  private queueEventsMap = new Map<QueueType, QueueEvents>();

  constructor(
    @InjectQueue(QueueType.Block) private indexerBlockQueue: Queue,
    @InjectQueue(QueueType.Transaction) private indexerTransactionQueue: Queue,
    @InjectQueue(QueueType.Output) private indexerOutputQueue: Queue,
    @InjectQueue(QueueType.LockScript) private indexerLockScriptQueue: Queue,
    @InjectQueue(QueueType.TypeScript) private indexerTypeScriptQueue: Queue,
  ) {
    this.IndexerQueues = [
      this.indexerBlockQueue,
      this.indexerTransactionQueue,
      this.indexerOutputQueue,
      this.indexerLockScriptQueue,
      this.indexerTypeScriptQueue,
    ];
    QUEUES.forEach((queueType) => {
      this.queueEventsMap.set(queueType, new QueueEvents(queueType));
    });
  }

  public getBlockQueue(): Queue {
    return this.indexerBlockQueue;
  }

  public getTransactionQueue(): Queue {
    return this.indexerTransactionQueue;
  }

  public getOutputQueue(): Queue {
    return this.indexerOutputQueue;
  }

  public getLockScriptQueue(): Queue {
    return this.indexerLockScriptQueue;
  }

  public getTypeScriptQueue(): Queue {
    return this.indexerTypeScriptQueue;
  }

  public getQueueEvents(queueType: QueueType): QueueEvents {
    return this.queueEventsMap.get(queueType)!;
  }

  public async delayActiveJobs(delayTime: number = 10000): Promise<void> {
    const delayedTime = Date.now() + delayTime;
    for (const queue of this.IndexerQueues) {
      await this.delayQueueJobs(queue, delayedTime);
    }
  }

  public async getJobCounts(options: GetJobCountsOpts): Promise<{ [key: string]: number }> {
    const queueCounts: { [index: string]: number }[] = [];
    for (const queue of this.IndexerQueues) {
      const counts = await queue.getJobCounts();
      this.logger.debug(`Queue ${queue.name} counts: ${JSON.stringify(counts)}`);
      queueCounts.push(counts);
    }

    const excludes = options.exclude || [];
    return queueCounts.reduce((sum, counts) => {
      Object.entries(counts).forEach(([key, value]) => {
        if (excludes.includes(key)) {
          return;
        }
        sum[key] = (sum[key] || 0) + value;
      });
      return sum;
    }, {});
  }

  private async delayQueueJobs(queue: Queue, delayedTime: number): Promise<void> {
    const activeJobs = await queue.getActive();
    for (const job of activeJobs) {
      await job.moveToDelayed(delayedTime);
    }
  }
}
