import { QueueOptions } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import cluster from 'cluster';
import { Env } from 'src/env';

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

export function createWorkerConfig(configService: ConfigService<Env>) {
  return {
    concurrency: configService.get('INDEXER_BATCH_SIZE') * configService.get('INDEXER_WORKER_NUM')!,
    useWorkerThreads: cluster.isWorker,
  };
}
