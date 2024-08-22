import { Job, Queue } from 'bullmq';
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
import { Env } from 'src/env';
import { ConfigService } from '@nestjs/config';
import { createWorkerConfig } from '../indexer.config';
import { BlockchainServiceFactory } from 'src/core/blockchain/blockchain.factory';

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
    private blockchainServiceFactory: BlockchainServiceFactory,
    @InjectQueue(INDEXER_BLOCK_QUEUE) private indexerBlockQueue: Queue,
    @InjectQueue(INDEXER_TRANSACTION_QUEUE) private indexerTransactionQueue: Queue,
  ) {
    super();
  }

  public async onModuleInit() {
    const { concurrency, useWorkerThreads } = createWorkerConfig(this.configService);
    this.worker.concurrency = concurrency;
    this.worker.opts.useWorkerThreads = useWorkerThreads;
  }

  public async process(job: Job<IndexerBlockJobData>): Promise<void> {
    const { chain, block } = job.data;
    const number = BI.from(block.header.number).toNumber();

    if (await this.isBlockAlreadyProcessed(chain, block.header.hash)) {
      return;
    }
    await this.processTransactions(chain, block);
    await this.saveBlockData(chain, block, number);
  }

  private async isBlockAlreadyProcessed(chain: Chain, hash: string): Promise<boolean> {
    const existingBlock = await this.getBlockByHash(chain, hash);
    if (existingBlock) {
      this.logger.warn(`Block ${hash} for chain ${chain.name} already exists`);
      return true;
    }
    return false;
  }

  private async processTransactions(chain: Chain, block: BlockchainInterface.Block): Promise<void> {
    const transactionJobs = this.createTransactionJobs(chain, block);
    await this.indexerTransactionQueue.addBulk(transactionJobs);
  }

  private async saveBlockData(
    chain: Chain,
    block: BlockchainInterface.Block,
    number: number,
  ): Promise<void> {
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
        size: 0, // TODO: implement block size calculation
      },
    });
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

  private createTransactionJobs(chain: Chain, block: BlockchainInterface.Block) {
    return block.transactions.map((transaction, index) => {
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
          priority: Math.max(1, 2097152 - (blockNumber % 2097152)),
        },
      };
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
    const [, ...txs] = block.transactions;
    const fees = await Promise.all(
      txs.map((tx) => this.indexerUtil.calculateTransactionFee(chain, tx)),
    );

    return fees.reduce(
      (acc, fee) => ({
        totalFee: acc.totalFee + fee,
        minFee: Math.min(acc.minFee, fee),
        maxFee: Math.max(acc.maxFee, fee),
      }),
      { totalFee: 0, minFee: Number.MAX_SAFE_INTEGER, maxFee: 0 },
    );
  }

  @OnWorkerEvent('active')
  onActive(job: Job<IndexerBlockJobData>) {
    const { chain, block } = job.data;
    this.logger.log(`Processing block ${block.header.hash} for chain ${chain.name}`);
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
    this.logger.warn(`Job ${jobId} stalled`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<IndexerBlockJobData>) {
    const { chain, block } = job.data;
    this.logger.log(`Block ${block.header.hash} for chain ${chain.name} processed successfully`);
  }
}
