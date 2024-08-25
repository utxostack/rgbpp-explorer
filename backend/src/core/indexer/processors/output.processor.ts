import { Job } from 'bullmq';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import * as BlockchainInterface from '../../blockchain/blockchain.interface';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Chain } from '@prisma/client';
import { Env } from 'src/env';
import { ConfigService } from '@nestjs/config';
import { createWorkerConfig } from '../indexer.config';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { BI } from '@ckb-lumos/bi';
import { computeScriptHash } from '@ckb-lumos/lumos/utils';
import { HashType, Script } from '@ckb-lumos/lumos';
import { RgbppCoreService } from 'src/core/rgbpp/rgbpp.service';
import { IndexerQueueService, QueueJobPriority, QueueType } from '../indexer.queue';

export interface IndexerOutputJobData {
  chain: Chain;
  txHash: string;
  index: string;
  output: BlockchainInterface.Output;
}

@Processor(QueueType.Output)
export class IndexerOutputProcessor extends WorkerHost implements OnModuleInit {
  private logger = new Logger(IndexerOutputProcessor.name);

  constructor(
    private configService: ConfigService<Env>,
    private prismaService: PrismaService,
    private indexerQueueService: IndexerQueueService,
    private rgbppCoreService: RgbppCoreService,
  ) {
    super();
  }

  public async onModuleInit() {
    const { concurrency, useWorkerThreads } = createWorkerConfig(this.configService);
    this.worker.concurrency = concurrency;
    this.worker.opts.useWorkerThreads = useWorkerThreads;
  }

  public async process(job: Job<IndexerOutputJobData>, token?: string): Promise<void> {
    const { chain, txHash, index, output } = job.data;

    const typeScriptHash = await this.processTypeScript(chain, output);
    const lockScriptHash = await this.processLockScript(chain, output);

    let rgbppBound = await this.isRgbppBoundOutput(output);
    let boundBtcTxId: string | undefined;
    let boundBtcTxIndex: number | undefined;
    if (rgbppBound) {
      try {
        const lockArgs = this.rgbppCoreService.parseRgbppLockArgs(output.lock.args);
        boundBtcTxId = lockArgs.btcTxid;
        boundBtcTxIndex = lockArgs.outIndex;
      } catch (error) {
        rgbppBound = false;
        this.logger.error(
          `Failed to parse RGBPP lock args for output ${index} of transaction ${txHash} for chain ${chain.name}`,
        );
      }
    }

    await this.prismaService.output.create({
      data: {
        chainId: chain.id,
        txHash,
        index,
        capacity: BI.from(output.capacity).toBigInt(),
        typeScriptHash,
        lockScriptHash,
        isLive: true,
        rgbppBound,
        boundBtcTxId,
        boundBtcTxIndex,
      },
    });
  }

  public async processTypeScript(
    chain: Chain,
    output: BlockchainInterface.Output,
  ): Promise<string | undefined> {
    if (!output.type) {
      return undefined;
    }
    const script: Script = {
      codeHash: output.type.code_hash,
      hashType: output.type.hash_type as HashType,
      args: output.type.args,
    };
    const scriptHash = computeScriptHash(script);
    const typeScriptQueue = this.indexerQueueService.getTypeScriptQueue();
    const job = await typeScriptQueue.add(
      scriptHash,
      { chain, script, scriptHash },
      {
        jobId: scriptHash,
        priority: QueueJobPriority.TypeScript,
      },
    );
    const queueEvents = this.indexerQueueService.getQueueEvents(QueueType.TypeScript);
    await job.waitUntilFinished(queueEvents);
    return scriptHash;
  }

  public async processLockScript(
    chain: Chain,
    output: BlockchainInterface.Output,
  ): Promise<string> {
    const script: Script = {
      codeHash: output.lock.code_hash,
      hashType: output.lock.hash_type as HashType,
      args: output.lock.args,
    };
    const scriptHash = computeScriptHash(script);
    const lockScriptQueue = this.indexerQueueService.getLockScriptQueue();
    const job = await lockScriptQueue.add(
      scriptHash,
      { chain, script, scriptHash },
      {
        jobId: scriptHash,
        priority: QueueJobPriority.LockScript,
      },
    );
    const queueEvents = this.indexerQueueService.getQueueEvents(QueueType.LockScript);
    await job.waitUntilFinished(queueEvents);
    return scriptHash;
  }

  public async isRgbppBoundOutput(output: BlockchainInterface.Output): Promise<boolean> {
    const lockScript: Script = {
      codeHash: output.lock.code_hash,
      hashType: output.lock.hash_type as HashType,
      args: output.lock.args,
    };
    return this.rgbppCoreService.isRgbppLockScript(lockScript);
  }

  @OnWorkerEvent('active')
  onActive(job: Job<IndexerOutputJobData>) {
    const { chain, txHash, index } = job.data;
    this.logger.log(`Processing output ${index} for transaction ${txHash} for chain ${chain.name}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<IndexerOutputJobData>, error: Error) {
    const { chain, txHash, index } = job.data;
    this.logger.error(
      `Failed to process output ${index} for transaction ${txHash} for chain ${chain.name}`,
    );
    this.logger.error(error.stack);
  }

  @OnWorkerEvent('stalled')
  onStalled(jobId: string) {
    this.logger.error(`Indexer Ouput Job ${jobId} stalled`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<IndexerOutputJobData>) {
    const { chain, txHash, index } = job.data;
    this.logger.log(`Processed output ${index} for transaction ${txHash} for chain ${chain.name}`);
  }
}
