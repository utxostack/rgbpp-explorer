import { DelayedError, Job, Queue } from 'bullmq';
import { InjectQueue, OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { PrismaService } from '../../database/prisma/prisma.service';
import * as BlockchainInterface from '../../blockchain/blockchain.interface';
import { BI } from '@ckb-lumos/bi';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Chain } from '@prisma/client';
import { compactToDifficulty } from 'src/common/ckb/difficulty';
import { INDEXER_TRANSACTION_QUEUE } from './transaction.processor';
import { IndexerUtil } from '../indexer.utils';
import { cloneDeep } from 'lodash';
import { CELLBASE_TX_HASH } from 'src/core/rgbpp/rgbpp.service';
import { Env } from 'src/env';
import { ConfigService } from '@nestjs/config';
import { createWorkerConfig } from '../indexer.config';

export const INDEXER_BLOCK_QUEUE = 'indexer-block-queue';

export interface IndexerBlockJobData {
  chain: Chain;
  block: BlockchainInterface.Block;
}

@Processor(INDEXER_BLOCK_QUEUE)
export class IndexerBlockProcessor extends WorkerHost implements OnModuleInit {
  private logger = new Logger(IndexerBlockProcessor.name);

  constructor(
    private prismaService: PrismaService,
    private indexerUtil: IndexerUtil,
    private configService: ConfigService<Env>,
    @InjectQueue(INDEXER_BLOCK_QUEUE) private indexerTransactionQueue: Queue,
    @InjectQueue(INDEXER_TRANSACTION_QUEUE) private indexerBlockQueue: Queue,
  ) {
    super();
  }

  public async onModuleInit() {
    const { concurrency, stalledInterval, useWorkerThreads } = createWorkerConfig(
      this.configService,
    );
    this.worker.concurrency = concurrency;
    this.worker.opts.stalledInterval = stalledInterval;
    this.worker.opts.useWorkerThreads = useWorkerThreads;
  }

  private getBlockByHash(chain: Chain, hash: string) {
    return this.prismaService.block.findUnique({
      where: {
        chainId_hash: {
          chainId: chain.id,
          hash,
        },
      },
    });
  }

  public async process(job: Job<IndexerBlockJobData>, token?: string): Promise<any> {
    const { chain, block } = job.data;
    const number = BI.from(block.header.number).toNumber();

    const existingBlock = await this.getBlockByHash(chain, block.header.hash);
    if (existingBlock) {
      this.logger.warn(`Block ${block.header.hash} for chain ${chain.name} already exists`);
      return;
    }

    // TODO: reorg handling

    if (block.header.parent_hash !== CELLBASE_TX_HASH) {
      const parentBlock = await this.getBlockByHash(chain, block.header.parent_hash);
      if (!parentBlock) {
        await job.moveToDelayed(Date.now() + 100, token);
        throw new DelayedError();
      }
    }

    const jobs = await Promise.all(
      block.transactions.map(async (transaction, index) => {
        const blockClone = cloneDeep(block);
        blockClone.transactions = [];
        const transactionClone = cloneDeep(transaction);
        const blockNumber = BI.from(block.header.number).toNumber();

        return {
          name: transaction.hash,
          data: {
            chain,
            block: blockClone,
            transaction: transactionClone,
            index,
          },
          opts: {
            jobId: transaction.hash,
            // the priorities go from 1 to 2 097 152
            // where a lower number is always a higher priority than higher numbers.
            priority: Math.max(1, 2097152 - (blockNumber % 2097152)),
          },
        };
      }),
    );
    await this.indexerTransactionQueue.addBulk(jobs);

    const { totalFee, minFee, maxFee } = await this.calculateBlockFees(chain, block);
    const difficulty = compactToDifficulty(block.header.compact_target).toBigInt();
    const timestamp = new Date(BI.from(block.header.timestamp).toNumber());

    await this.prismaService.block.create({
      data: {
        chainId: chain.id,
        number,
        hash: block.header.hash,
        transactionsCount: block.transactions.length,
        timestamp,
        totalFee,
        minFee,
        maxFee,
        difficulty,
        // TODO: implement block size calculation
        size: 0,
      },
    });
  }

  public async calculateBlockFees(
    chain: Chain,
    block: BlockchainInterface.Block,
  ): Promise<{
    totalFee: number;
    minFee: number;
    maxFee: number;
  }> {
    const [_, ...txs] = block.transactions;
    const fees = await Promise.all(
      txs.map((tx) => this.indexerUtil.calculateTransactionFee(chain, tx)),
    );

    let totalFee = 0;
    let minFee = Number.MAX_SAFE_INTEGER;
    let maxFee = 0;
    for (const fee of fees) {
      totalFee += fee;
      minFee = Math.min(minFee, fee);
      maxFee = Math.max(maxFee, fee);
    }
    return {
      totalFee,
      minFee,
      maxFee,
    };
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<IndexerBlockJobData>, error: Error) {
    const { chain, block } = job.data;
    this.logger.error(
      `Job ${job.id} failed for block ${block.header.hash} for chain ${chain.name}: ${error.message}`,
    );
    this.logger.error(error.stack);
  }

  @OnWorkerEvent('stalled')
  onStalled(jobId: string) {
    this.logger.error(`Job ${jobId} stalled`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<IndexerBlockJobData>) {
    const { chain, block } = job.data;
    this.logger.log(`Block ${block.header.hash} for chain ${chain.name} processed successfully`);
  }
}
