import { DelayedError, Job } from 'bullmq';
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
import { BlockchainService } from 'src/core/blockchain/blockchain.service';

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
    const { concurrency, useWorkerThreads } = createWorkerConfig(this.configService);
    this.worker.concurrency = concurrency;
    this.worker.opts.useWorkerThreads = useWorkerThreads;
  }

  public async process(job: Job<IndexerTransactionJobData>, token?: string): Promise<void> {
    const { chain, block, transaction, index } = job.data;
    if (!transaction) {
      throw new Error(`Transaction not found at index ${index}, block ${block.header.hash}`);
    }
    if (await this.isTransactionAlreadyProcessed(chain, transaction.hash)) {
      return;
    }

    const inputTxs = await this.getInputTransactions(chain, transaction, token, job);
    const blockchainService = await this.blockchainServiceFactory.getService(chain.id);
    const transactionData = await this.prepareTransactionData(
      chain,
      block,
      transaction,
      inputTxs,
      blockchainService,
    );
    await this.saveTransaction(transactionData);
  }

  private async isTransactionAlreadyProcessed(chain: Chain, hash: string): Promise<boolean> {
    const existingTransaction = await this.getTransactionByHash(chain, hash);
    if (existingTransaction) {
      this.logger.warn(`Transaction ${hash} already exists in the database, skipping`);
      return true;
    }
    return false;
  }

  private async getInputTransactions(
    chain: Chain,
    transaction: BlockchainInterface.Transaction,
    token: string | undefined,
    job: Job<IndexerTransactionJobData>,
  ) {
    const inputTxHashes = new Set(
      transaction.inputs
        .map((input) => input.previous_output.tx_hash)
        .filter((txhash) => txhash !== CELLBASE_TX_HASH),
    );
    const inputTxs = await Promise.all(
      Array.from(inputTxHashes).map((txhash) => this.getTransactionByHash(chain, txhash)),
    );
    if (inputTxs.some((tx) => !tx)) {
      await job.moveToDelayed(Date.now() + 1000, token);
      throw new DelayedError();
    }
    return inputTxs;
  }

  private async prepareTransactionData(
    chain: Chain,
    block: Omit<BlockchainInterface.Block, 'transactions'>,
    transaction: BlockchainInterface.Transaction,
    inputTxs: BlockchainInterface.Transaction[],
    blockchainService: BlockchainService,
  ) {
    const blockNumber = BI.from(block.header.number).toNumber();
    const timestamp = new Date(BI.from(block.header.timestamp).toNumber());
    const isCellbase = this.isCellbase(transaction);
    const fee = isCellbase ? 0 : await this.indexerUtil.calculateTransactionFee(chain, transaction);
    const isRgbpp = this.isRgbppTransaction(transaction);
    const leapDirection = await this.getLeapDirection(isCellbase, transaction, blockchainService);

    return {
      chainId: chain.id,
      hash: transaction.hash,
      index: BI.from(block.header.number).toNumber(),
      blockNumber,
      timestamp,
      fee,
      size: 0, // TODO: implement transaction size calculation
      isCellbase,
      isRgbpp,
      leapDirection: leapDirection ? DBLeapDirectionMap[leapDirection] : null,
    };
  }

  private async saveTransaction(transactionData: any) {
    await this.prismaService.transaction.create({ data: transactionData });
  }

  private isCellbase(transaction: BlockchainInterface.Transaction): boolean {
    return (
      transaction.inputs.length === 1 &&
      transaction.inputs[0].previous_output.tx_hash === CELLBASE_TX_HASH
    );
  }

  private isRgbppTransaction(transaction: BlockchainInterface.Transaction): boolean {
    return transaction.outputs.some((output) => {
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
  }

  private async getLeapDirection(
    isCellbase: boolean,
    transaction: BlockchainInterface.Transaction,
    blockchainService: any,
  ): Promise<LeapDirection | null> {
    if (isCellbase) {
      return null;
    }
    return await this.rgbppCoreService.getRgbppTxLeapDirection(transaction, async (txhash) => {
      const tx = await blockchainService.getTransaction(txhash);
      return tx.transaction;
    });
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
