import { Job, Queue } from 'bullmq';
import { InjectQueue, OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { PrismaService } from '../../database/prisma/prisma.service';
import * as BlockchainInterface from '../../blockchain/blockchain.interface';
import { Logger } from '@nestjs/common';
import { Chain, LeapDirection as DBLeapDirection } from '@prisma/client';
import { BI } from '@ckb-lumos/bi';
import { IndexerUtil } from '../indexer.utils';
import { HashType, Script } from '@ckb-lumos/lumos';
import { CELLBASE_TX_HASH, LeapDirection, RgbppCoreService } from 'src/core/rgbpp/rgbpp.service';
import { BlockchainServiceFactory } from 'src/core/blockchain/blockchain.factory';

export const INDEXER_TRANSACTION_QUEUE = 'indexer-transaction-queue';

const DBLeapDirectionMap: Record<LeapDirection, DBLeapDirection> = {
  [LeapDirection.LeapIn]: DBLeapDirection.LeapIn,
  [LeapDirection.LeapOut]: DBLeapDirection.LeapOut,
  [LeapDirection.Within]: DBLeapDirection.Within,
};

export interface IndexerTransactionJobData {
  chain: Chain;
  block: BlockchainInterface.Block;
  index: string;
}

@Processor(INDEXER_TRANSACTION_QUEUE, {
  concurrency: 100,
})
export class IndexerTransactionProcessor extends WorkerHost {
  private logger = new Logger(IndexerTransactionProcessor.name);

  constructor(
    private prismaService: PrismaService,
    private indexerUtil: IndexerUtil,
    private blockchainServiceFactory: BlockchainServiceFactory,
    private rgbppCoreService: RgbppCoreService,
    @InjectQueue(INDEXER_TRANSACTION_QUEUE) private queue: Queue,
  ) {
    super();
  }

  private isCellbase(transaction: BlockchainInterface.Transaction) {
    return (
      transaction.inputs.length === 1 &&
      transaction.inputs[0].previous_output.tx_hash === CELLBASE_TX_HASH
    );
  }

  public async process(job: Job<IndexerTransactionJobData>, token?: string): Promise<any> {
    const { chain, block } = job.data;
    const index = BI.from(job.data.index).toNumber();
    const transaction = block.transactions[index];
    if (!transaction) {
      throw new Error(`Transaction not found at index ${index}, block ${block.header.hash}`);
    }
    this.logger.log(`Processing transaction ${transaction.hash} for chain ${chain.name}`);

    const existingTransaction = await this.prismaService.transaction.findUnique({
      where: {
        chainId_hash: {
          chainId: chain.id,
          hash: transaction.hash
        }
      },
    });
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
    this.logger.log(
      `Transaction ${transaction.hash} for chain ${chain.name} processed successfully`,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<IndexerTransactionJobData>, error: Error) {
    this.logger.error(error.stack);
  }
}
