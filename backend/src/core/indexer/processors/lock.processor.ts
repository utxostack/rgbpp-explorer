import { Job } from 'bullmq';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Chain } from '@prisma/client';
import { Env } from 'src/env';
import { ConfigService } from '@nestjs/config';
import { createWorkerConfig } from '../indexer.config';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { RgbppCoreService } from 'src/core/rgbpp/rgbpp.service';
import { QueueType } from '../indexer.queue';
import { Script } from '@ckb-lumos/lumos';

export interface IndexerLockScriptJobData {
  chain: Chain;
  script: Script;
  scriptHash: string;
}

@Processor(QueueType.LockScript)
export class IndexerLockScriptProcessor extends WorkerHost implements OnModuleInit {
  private logger = new Logger(IndexerLockScriptProcessor.name);

  constructor(
    private configService: ConfigService<Env>,
    private prismaService: PrismaService,
    private rgbppCoreService: RgbppCoreService,
  ) {
    super();
  }

  public async onModuleInit() {
    const { concurrency, useWorkerThreads } = createWorkerConfig(this.configService);
    this.worker.concurrency = concurrency;
    this.worker.opts.useWorkerThreads = useWorkerThreads;
  }

  public async process(job: Job<IndexerLockScriptJobData>): Promise<void> {
    const { chain, script, scriptHash } = job.data;
    await this.prismaService.$transaction(async (tx) => {
      const existLockScript = await tx.lockScript.findUnique({
        where: {
          chainId_scriptHash: {
            chainId: chain.id,
            scriptHash,
          },
        },
      });
      if (existLockScript) {
        return existLockScript.id;
      }

      const isRgbppLock = this.rgbppCoreService.isRgbppLockScript(script);
      const isBtcTimeLock = this.rgbppCoreService.isBtcTimeLockScript(script);
      const lockScript = await tx.lockScript.upsert({
        where: {
          chainId_scriptHash: {
            chainId: chain.id,
            scriptHash,
          }
        },
        update: {},
        create: {
          chainId: chain.id,
          codeHash: script.codeHash,
          hashType: script.hashType,
          args: script.args,
          scriptHash,
          isRgbppLock,
          isBtcTimeLock,
        },
      });
      return lockScript.id;
    });
  }

  @OnWorkerEvent('active')
  onActive(job: Job<IndexerLockScriptJobData>) {
    const { chain, scriptHash } = job.data;
    this.logger.log(`Processing LockScript ${scriptHash} for chain ${chain.name}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<IndexerLockScriptJobData>, error: Error) {
    const { chain, scriptHash } = job.data;
    this.logger.error(`Failed to process LockScript ${scriptHash} for chain ${chain.name}`);
    this.logger.error(error.stack);
  }

  @OnWorkerEvent('stalled')
  onStalled(jobId: string) {
    this.logger.warn(`Indexer LockScript Job ${jobId} stalled`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<IndexerLockScriptJobData>) {
    const { chain, scriptHash } = job.data;
    this.logger.log(`Completed processing LockScript ${scriptHash} for chain ${chain.name}`);
  }
}
