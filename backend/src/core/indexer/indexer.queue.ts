import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { INDEXER_BLOCK_QUEUE } from './processors/block.processor';
import { INDEXER_TRANSACTION_QUEUE } from './processors/transaction.processor';

@Injectable()
export class IndexerQueueService {
  constructor(
    @InjectQueue(INDEXER_BLOCK_QUEUE) private indexerBlockQueue: Queue,
    @InjectQueue(INDEXER_TRANSACTION_QUEUE) private indexerTransactionQueue: Queue,
  ) {}

  public getBlockQueue(): Queue {
    return this.indexerBlockQueue;
  }

  public async delayActiveJobs(delayTime: number = 10000): Promise<void> {
    const delayedTime = Date.now() + delayTime;
    await this.delayQueueJobs(this.indexerBlockQueue, delayedTime);
    await this.delayQueueJobs(this.indexerTransactionQueue, delayedTime);
  }

  public async getJobCounts(): Promise<{ [key: string]: number }> {
    const blockQueueCounts = await this.indexerBlockQueue.getJobCounts();
    const transactionQueueCounts = await this.indexerTransactionQueue.getJobCounts();

    return this.mergeJobCounts(blockQueueCounts, transactionQueueCounts);
  }

  private async delayQueueJobs(queue: Queue, delayedTime: number): Promise<void> {
    const activeJobs = await queue.getActive();
    for (const job of activeJobs) {
      await job.moveToDelayed(delayedTime);
    }
  }

  private mergeJobCounts(...queueCounts: { [key: string]: number }[]): { [key: string]: number } {
    return queueCounts.reduce((sum, counts) => {
      Object.entries(counts).forEach(([key, value]) => {
        sum[key] = (sum[key] || 0) + value;
      });
      return sum;
    }, {});
  }
}
