import { Script } from '@ckb-lumos/lumos';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { computeScriptHash } from '@ckb-lumos/lumos/utils';
import * as Sentry from '@sentry/node';

export const INDEXER_TYPE_QUEUE = 'indexer-type-queue';

export interface IndexerTypeJobData {
  chainId: number;
  script: Script;
}

@Processor(INDEXER_TYPE_QUEUE, {
  stalledInterval: 60_000,
  useWorkerThreads: true,
})
export class IndexerTypeProcessor extends WorkerHost {
  private logger = new Logger(IndexerTypeProcessor.name);

  constructor(private prismaService: PrismaService) {
    super();
  }

  @OnWorkerEvent('active')
  public onActive(job: Job<IndexerTypeJobData>) {
    const { chainId, script } = job.data;
    this.logger.debug(
      `Indexing lock script for chain ${chainId} with script hash ${computeScriptHash(script)}`,
    );
  }

  @OnWorkerEvent('completed')
  public onCompleted(job: Job<IndexerTypeJobData>) {
    const { chainId, script } = job.data;
    this.logger.log(
      `Indexing lock script for chain ${chainId} with script hash ${computeScriptHash(script)} completed`,
    );
  }

  @OnWorkerEvent('failed')
  public onFailed(job: Job<IndexerTypeJobData>, error: Error) {
    const { chainId, script } = job.data;
    this.logger.error(
      `Indexing lock script for chain ${chainId} with script hash ${computeScriptHash(script)} failed`,
    );
    this.logger.error(error.stack);
    Sentry.captureException(error);
  }

  public async process(job: Job<IndexerTypeJobData>): Promise<any> {
    const { chainId, script } = job.data;
    const scriptHash = computeScriptHash(script);

    await this.prismaService.typeScript.upsert({
      where: {
        chainId_scriptHash: {
          chainId,
          scriptHash,
        },
      },
      update: {},
      create: {
        chainId,
        scriptHash,
        ...script,
      },
    });
  }
}
