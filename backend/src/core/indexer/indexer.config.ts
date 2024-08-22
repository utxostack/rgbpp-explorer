import { QueueOptions } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import cluster from 'cluster';

export function createCommonQueueConfig(): Omit<QueueOptions, 'connection'> {
  return {
    defaultJobOptions: {
      attempts: 10,
      backoff: {
        type: 'fixed',
        delay: 5000,
      },
      removeOnComplete: true,
    },
  };
}

export function createWorkerConfig(configService: ConfigService) {
  return {
    concurrency: 100 * configService.get('INDEXER_WORKER_NUM')!,
    stalledInterval: 10 * 60 * 1000,
    useWorkerThreads: cluster.isWorker,
  };
}
