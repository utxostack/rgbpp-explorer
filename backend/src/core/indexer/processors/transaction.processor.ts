import { DelayedError, Job } from 'bullmq';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { PrismaService } from '../../database/prisma/prisma.service';
import * as BlockchainInterface from '../../blockchain/blockchain.interface';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Chain, LeapDirection as DBLeapDirection } from '@prisma/client';
import { BI } from '@ckb-lumos/bi';
import { IndexerUtilService } from '../indexer.utils';
import { HashType, Script } from '@ckb-lumos/lumos';
import { CELLBASE_TX_HASH, LeapDirection, RgbppCoreService } from 'src/core/rgbpp/rgbpp.service';
import { BlockchainServiceFactory } from 'src/core/blockchain/blockchain.factory';
import { Env } from 'src/env';
import { ConfigService } from '@nestjs/config';
import { createWorkerConfig } from '../indexer.config';
import { BlockchainService } from 'src/core/blockchain/blockchain.service';
import { IndexerQueueService, QueueJobPriority, QueueType } from '../indexer.queue';
import { IndexerOutputJobData } from './output.processor';

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

@Processor(QueueType.Transaction)
export class IndexerTransactionProcessor extends WorkerHost implements OnModuleInit {
  private logger = new Logger(IndexerTransactionProcessor.name);

  constructor(
    private configService: ConfigService<Env>,
    private prismaService: PrismaService,
    private indexerQueueService: IndexerQueueService,
    private indexerUtilService: IndexerUtilService,
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

  public async process(job: Job<IndexerTransactionJobData>): Promise<void> {
    const { chain, block, transaction, index } = job.data;
    if (await this.isTransactionAlreadyProcessed(chain, transaction.hash)) {
      return;
    }
    await this.waitUntilBlockFinished(block);
    await this.waitUntilInputTransactionsFinished(transaction);

    const blockchainService = await this.blockchainServiceFactory.getService(chain.id);
    const blockNumber = BI.from(block.header.number).toNumber();
    const timestamp = new Date(BI.from(block.header.timestamp).toNumber());
    const isCellbase = this.indexerUtilService.isCellbase(transaction);
    const fee = isCellbase
      ? 0n
      : await this.indexerUtilService.calculateTransactionFee(chain, transaction);
    const isRgbpp = this.isRgbppTransaction(transaction);
    const leapDirection = await this.getLeapDirection(isCellbase, transaction, blockchainService);

    await this.processTransactionInputs(chain, transaction);
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
    await this.processTransactionOutputs(chain, transaction);
  }

  private async isTransactionAlreadyProcessed(chain: Chain, hash: string): Promise<boolean> {
    const existingTransaction = await this.getTransactionByHash(chain, hash);
    if (existingTransaction) {
      this.logger.warn(`Transaction ${hash} already exists in the database, skipping`);
      return true;
    }
    return false;
  }

  private async waitUntilBlockFinished(block: IndexerTransactionJobData['block']) {
    const blockQueue = this.indexerQueueService.getBlockQueue();
    const blockJob = await blockQueue.getJob(block.header.hash);
    if (!blockJob) {
      throw new DelayedError('Block job not found');
    }
    const queueEvents = this.indexerQueueService.getQueueEvents(QueueType.Block);
    await blockJob.waitUntilFinished(queueEvents);
  }

  private async waitUntilInputTransactionsFinished(
    transaction: IndexerTransactionJobData['transaction'],
  ) {
    const transactionQueue = this.indexerQueueService.getTransactionQueue();
    const inputTxHashes = new Set(
      transaction.inputs
        .map((input) => input.previous_output.tx_hash)
        .filter((txhash) => txhash !== CELLBASE_TX_HASH),
    );
    const queueEvents = this.indexerQueueService.getQueueEvents(QueueType.Transaction);
    await Promise.all(
      Array.from(inputTxHashes).map(async (txhash) => {
        const txJob = await transactionQueue.getJob(txhash);
        if (!txJob) {
          throw new DelayedError(`Transaction job ${txhash} not found`);
        }
        await txJob.waitUntilFinished(queueEvents);
      }),
    );
  }

  private async processTransactionInputs(
    chain: Chain,
    transaction: BlockchainInterface.Transaction,
  ) {
    await this.prismaService.$transaction(async (tx) => {
      await Promise.all(
        transaction.inputs
          .filter((input) => input.previous_output.tx_hash !== CELLBASE_TX_HASH)
          .map((input, index) => {
            return tx.output.update({
              where: {
                chainId_txHash_index: {
                  chainId: chain.id,
                  txHash: input.previous_output.tx_hash,
                  index: input.previous_output.index,
                },
              },
              data: {
                isLive: false,
                consumedByTxHash: transaction.hash,
                consumedByIndex: BI.from(index).toHexString(),
              },
            });
          }),
      );
    });
  }

  private async processTransactionOutputs(
    chain: Chain,
    transaction: BlockchainInterface.Transaction,
  ) {
    const outputJobs = this.createOutputJobs(chain, transaction);
    const outputQueue = this.indexerQueueService.getOutputQueue();
    const jobs = await outputQueue.addBulk(outputJobs);
    const queueEvents = this.indexerQueueService.getQueueEvents(QueueType.Output);
    await Promise.all(jobs.map((job) => job.waitUntilFinished(queueEvents)));
  }

  private createOutputJobs(chain: Chain, transaction: BlockchainInterface.Transaction) {
    return transaction.outputs.map((output, index) => {
      const jobId = `${transaction.hash}:${index}`;
      return {
        name: jobId,
        data: {
          chain,
          txHash: transaction.hash,
          index: BI.from(index).toHexString(),
          output,
        } satisfies IndexerOutputJobData,
        opts: {
          jobId,
          priority: QueueJobPriority.Output,
        },
      };
    });
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
    blockchainService: BlockchainService,
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
