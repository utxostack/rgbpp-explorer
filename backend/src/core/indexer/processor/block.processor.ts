import { BI } from '@ckb-lumos/bi';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Job } from 'bullmq';
import { BlockchainServiceFactory } from 'src/core/blockchain/blockchain.factory';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import * as Sentry from '@sentry/node';
import { toNumber } from 'lodash';
import { IndexerQueueService } from '../indexer.queue';
import { IndexerServiceFactory } from '../indexer.factory';
import { IndexerTransactionsEvent } from '../flow/transactions.flow';

export const INDEXER_BLOCK_QUEUE = 'indexer-block-queue';

export interface IndexerBlockJobData {
  chainId: number;
  blockNumber: number;
  targetBlockNumber: number;
}

@Processor(INDEXER_BLOCK_QUEUE, {
  concurrency: 100,
})
export class IndexerBlockProcessor extends WorkerHost {
  private logger = new Logger(IndexerBlockProcessor.name);

  constructor(
    private blockchainServiceFactory: BlockchainServiceFactory,
    private prismaService: PrismaService,
    private moduleRef: ModuleRef,
  ) {
    super();
  }

  @OnWorkerEvent('active')
  public onActive(job: Job<IndexerBlockJobData>) {
    const { chainId, blockNumber } = job.data;
    this.logger.debug(`Indexing block ${blockNumber} for chain ${chainId}`);
  }

  @OnWorkerEvent('completed')
  public onCompleted(job: Job<IndexerBlockJobData>) {
    const { chainId, blockNumber } = job.data;
    this.logger.log(`Indexing block ${blockNumber} for chain ${chainId} completed`);
  }

  @OnWorkerEvent('failed')
  public onFailed(job: Job<IndexerBlockJobData>, error: Error) {
    const { chainId, blockNumber } = job.data;
    this.logger.error(`Indexing block ${blockNumber} for chain ${chainId} failed`);
    this.logger.error(error.stack);
    Sentry.captureException(error);
  }

  public async process(job: Job<IndexerBlockJobData>): Promise<any> {
    const { chainId, blockNumber, targetBlockNumber } = job.data;
    const block = await this.getBlock(job);
    const indexerQueueService = this.moduleRef.get(IndexerQueueService);

    block.transactions.forEach((transaction, index) => {
      indexerQueueService.addTransactionJob({
        chainId,
        blockNumber,
        index,
        transaction,
      });
    });
    await this.prismaService.block.upsert({
      where: {
        chainId_number: {
          chainId: job.data.chainId,
          number: job.data.blockNumber,
        },
      },
      update: {},
      create: {
        chainId,
        hash: block.header.hash,
        number: BI.from(block.header.number).toNumber(),
        timestamp: new Date(toNumber(block.header.timestamp)),
        transactionsCount: block.transactions.length,
      },
    });

    if (blockNumber < targetBlockNumber) {
      await indexerQueueService.addBlockJob({
        chainId,
        blockNumber: blockNumber + 1,
        targetBlockNumber,
      });
    } else {
      const indexerServiceFactory = this.moduleRef.get(IndexerServiceFactory);
      const indexerService = await indexerServiceFactory.getService(chainId);
      indexerService.transactionsFlow.emit(IndexerTransactionsEvent.BlockIndexed, block);
      return;
    }
  }

  private async getBlock(job: Job<IndexerBlockJobData>) {
    const { chainId, blockNumber } = job.data;
    const blockchainService = this.blockchainServiceFactory.getService(chainId);
    const block = await blockchainService.getBlockByNumber(BI.from(blockNumber).toHexString());
    return block;
  }
}
