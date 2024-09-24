import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { CoreService } from 'src/core/core.service';
import { Transaction } from 'src/core/blockchain/blockchain.interface';
import { Script, HashType } from '@ckb-lumos/lumos';
import * as Sentry from '@sentry/node';

export const INDEXER_TRANSACTION_QUEUE = 'indexer-transaction-queue';

export interface IndexerTransactionJobData {
  chainId: number;
  blockNumber: number;
  index: number;
  transaction: Transaction;
}

@Processor(INDEXER_TRANSACTION_QUEUE, {
  concurrency: 100,
  stalledInterval: 60_000,
})
export class IndexerTransactionProcessor extends WorkerHost {
  private logger = new Logger(IndexerTransactionProcessor.name);

  constructor(
    private prismaService: PrismaService,
    private coreService: CoreService,
  ) {
    super();
  }

  @OnWorkerEvent('active')
  public onActive(job: Job<IndexerTransactionJobData>) {
    const { chainId, transaction } = job.data;
    this.logger.debug(`Indexing transaction ${transaction.hash} for chain ${chainId}`);
  }

  @OnWorkerEvent('completed')
  public onCompleted(job: Job<IndexerTransactionJobData>) {
    const { chainId, transaction } = job.data;
    this.logger.log(`Indexing transaction ${transaction.hash} for chain ${chainId} completed`);
  }

  @OnWorkerEvent('failed')
  public onFailed(job: Job<IndexerTransactionJobData>, error: Error) {
    const { chainId, transaction } = job.data;
    this.logger.error(`Indexing transaction ${transaction.hash} for chain ${chainId} failed`);
    this.logger.error(error.stack);
    Sentry.captureException(error);
  }

  public async process(job: Job<IndexerTransactionJobData>): Promise<any> {
    const { chainId, blockNumber, index, transaction } = job.data;
    const assetTypeScripts = await this.prismaService.assetType.findMany({
      where: { chainId },
    });

    const hasRgbppAssets = transaction.outputs.some((output) => {
      if (!output.type) return false;
      const typeScript: Script = {
        codeHash: output.type.code_hash,
        hashType: output.type.hash_type as HashType,
        args: output.type.args,
      };
      return assetTypeScripts.some((assetType) => {
        return (
          assetType.codeHash === typeScript.codeHash && assetType.hashType === typeScript.hashType
        );
      });
    });
    if (!hasRgbppAssets) {
      this.logger.debug(`Transaction ${transaction.hash} does not contain any RGB++ assets`);
      return;
    }

    const { isRgbpp, btcTxid, leapDirection } = await this.parseTransaction(chainId, transaction);
    await this.prismaService.transaction.upsert({
      where: {
        chainId_hash: {
          chainId,
          hash: transaction.hash,
        },
      },
      update: {},
      create: {
        chainId,
        hash: transaction.hash,
        index,
        blockNumber,
        isCellbase: index === 0,
        isRgbpp,
        btcTxid,
        leapDirection,
        inputCount: transaction.inputs.length,
        outputCount: transaction.outputs.length,
      },
    });
  }

  private async parseTransaction(chainId: number, transaction: Transaction) {
    const rgbppCell = transaction.outputs.find((output) => {
      const lock: Script = {
        codeHash: output.lock.code_hash,
        hashType: output.lock.hash_type as HashType,
        args: output.lock.args,
      };
      return this.coreService.isRgbppLockScript(lock) || this.coreService.isBtcTimeLockScript(lock);
    });

    if (rgbppCell) {
      let btcTxid: string | null = null;
      try {
        const args = this.coreService.parseRgbppLockArgs(rgbppCell.lock.args);
        btcTxid = args.btcTxid;
      } catch (err) {
        this.logger.error(err);
      }

      const leapDirection = await this.coreService.getLeapDirectionByCkbTx(chainId, transaction);
      return {
        isRgbpp: true,
        btcTxid,
        leapDirection,
      };
    }
    return {
      isRgbpp: false,
      btcTxid: null,
      leapDirection: null,
    };
  }
}
