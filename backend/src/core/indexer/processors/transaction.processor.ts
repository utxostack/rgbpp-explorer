import { Job } from 'bullmq';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { PrismaService } from '../../database/prisma/prisma.service';
import * as BlockchainInterface from '../../blockchain/blockchain.interface';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Chain, LeapDirection as DBLeapDirection } from '@prisma/client';
import { BI } from '@ckb-lumos/bi';
import { IndexerUtil } from '../indexer.utils';
import { HashType, Script } from '@ckb-lumos/lumos';
import { CELLBASE_TX_HASH, LeapDirection, RgbppCoreService } from 'src/core/rgbpp/rgbpp.service';
import { BlockchainServiceFactory } from 'src/core/blockchain/blockchain.factory';
import { Env } from 'src/env';
import { ConfigService } from '@nestjs/config';
import { createWorkerConfig } from '../indexer.config';

export const INDEXER_TRANSACTION_QUEUE = 'indexer-transaction-queue';

const DBLeapDirectionMap: Record<LeapDirection, DBLeapDirection> = {
  [LeapDirection.LeapIn]: DBLeapDirection.LeapIn,
  [LeapDirection.LeapOut]: DBLeapDirection.LeapOut,
  [LeapDirection.Within]: DBLeapDirection.Within,
};

export interface IndexerTransactionJobData {
  chain: Chain;
  block: Omit<BlockchainInterface.Block, 'transactions'>;
  transaction: BlockchainInterface.Transaction;
  index: string;
}

@Processor(INDEXER_TRANSACTION_QUEUE)
export class IndexerTransactionProcessor extends WorkerHost implements OnModuleInit {
  private logger = new Logger(IndexerTransactionProcessor.name);

  constructor(
    private configService: ConfigService<Env>,
    private prismaService: PrismaService,
    private indexerUtil: IndexerUtil,
    private blockchainServiceFactory: BlockchainServiceFactory,
    private rgbppCoreService: RgbppCoreService,
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

  private isCellbase(transaction: BlockchainInterface.Transaction) {
    return (
      transaction.inputs.length === 1 &&
      transaction.inputs[0].previous_output.tx_hash === CELLBASE_TX_HASH
    );
  }

  private async getTransactionByHash(chain: Chain, hash: string) {
    return this.prismaService.transaction.findUnique({
      where: {
        chainId_hash: {
          chainId: chain.id,
          hash,
        },
      },
    });
  }

  public async process(job: Job<IndexerTransactionJobData>, token?: string): Promise<any> {
    const { chain, block, transaction } = job.data;
    const index = BI.from(job.data.index).toNumber();
    if (!transaction) {
      throw new Error(`Transaction not found at index ${index}, block ${block.header.hash}`);
    }
    const existingTransaction = await this.getTransactionByHash(chain, transaction.hash);
    if (existingTransaction) {
      this.logger.warn(`Transaction ${transaction.hash} already exists in the database, skipping`);
      return;
    }

    const blockchainService = await this.blockchainServiceFactory.getService(chain.id);
    const blockNumber = BI.from(block.header.number).toNumber();
    const timestamp = new Date(BI.from(block.header.timestamp).toNumber());
    const isCellbase = this.isCellbase(transaction);
    const fee = isCellbase ? 0 : await this.indexerUtil.calculateTransactionFee(chain, transaction);

    const isRgbpp = transaction.outputs.some((output) => {
      const script: Script = {
        codeHash: output.lock.code_hash,
        hashType: output.lock.hash_type as HashType,
        args: output.lock.args,
      };
      return (
        this.rgbppCoreService.isRgbppLockScript(script) ||
        this.rgbppCoreService.isBtcTimeLockScript(script)
      );
    });

    const leapDirection = isCellbase
      ? null
      : await this.rgbppCoreService.getRgbppTxLeapDirection(transaction, async (txhash) => {
          const tx = await blockchainService.getTransaction(txhash);
          return tx.transaction;
        });

    await this.prismaService.transaction.create({
      data: {
        chainId: chain.id,
        hash: transaction.hash,
        index,
        blockNumber,
        timestamp,
        fee,
        size: 0, // TODO: implement transaction size calculation
        isCellbase,
        isRgbpp,
        leapDirection: leapDirection ? DBLeapDirectionMap[leapDirection] : null,
      },
    });
  }

  @OnWorkerEvent('active')
  onActive(job: Job<IndexerTransactionJobData>) {
    const { chain, transaction } = job.data;
    this.logger.debug(`Processing transaction ${transaction.hash} for chain ${chain.name}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<IndexerTransactionJobData>, error: Error) {
    const { chain, transaction } = job.data;
    this.logger.error(
      `Job ${job.id} failed for transaction ${transaction.hash} for chain ${chain.name}: ${error.message}`,
    );
    this.logger.error(error.stack);
  }

  @OnWorkerEvent('stalled')
  onStalled(jobId: string) {
    this.logger.error(`Job ${jobId} stalled`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<IndexerTransactionJobData>) {
    const { chain, transaction } = job.data;
    this.logger.log(
      `Transaction ${transaction.hash} for chain ${chain.name} processed successfully`,
    );
  }
}
