import { Logger } from '@nestjs/common';
import { Chain } from '@prisma/client';
import { EventEmitter } from 'node:events';
import { CKB_MIN_SAFE_CONFIRMATIONS } from 'src/constants';
import { BlockchainService } from 'src/core/blockchain/blockchain.service';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { IndexerQueueService } from '../indexer.queue';
import { ONE_DAY_MS } from 'src/common/date';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

const CKB_24_HOURS_BLOCK_NUMBER = ONE_DAY_MS / 10000;

export enum IndexerTransactionsEvent {
  BlockIndexed = 'block-indexed',
}

export class IndexerTransactionsFlow extends EventEmitter {
  private readonly logger = new Logger(IndexerTransactionsFlow.name);

  constructor(
    private chain: Chain,
    private blockchainService: BlockchainService,
    private prismaService: PrismaService,
    private indexerQueueService: IndexerQueueService,
    private schedulerRegistry: SchedulerRegistry,
  ) {
    super();
  }

  public async start() {
    this.setupBlockIndexedListener();
    this.startBlockIndexing();
  }

  public async startBlockIndexing() {
    const tipBlockNumber = await this.blockchainService.getTipBlockNumber();
    let startBlockNumber = tipBlockNumber - CKB_24_HOURS_BLOCK_NUMBER;
    const targetBlockNumber = tipBlockNumber - CKB_MIN_SAFE_CONFIRMATIONS;

    const block = await this.prismaService.block.findFirst({
      where: { chainId: this.chain.id },
      orderBy: { number: 'desc' },
    });
    if (block) {
      startBlockNumber = Math.max(startBlockNumber, block.number + 1);
    }

    if (startBlockNumber >= targetBlockNumber) {
      this.emit(IndexerTransactionsEvent.BlockIndexed);
      return;
    }
    this.logger.log(`Indexing blocks from ${startBlockNumber} to ${targetBlockNumber}`);
    this.indexerQueueService.addBlockJob({
      chainId: this.chain.id,
      blockNumber: startBlockNumber,
      targetBlockNumber,
    });
  }

  private setupBlockIndexedListener() {
    this.on(IndexerTransactionsEvent.BlockIndexed, () => {
      if (this.schedulerRegistry.doesExist('cron', 'indexer-transactions')) {
        return;
      }

      this.logger.log(`Scheduling block transactions indexing cron job`);
      const job = new CronJob(CronExpression.EVERY_10_SECONDS, () => {
        this.startBlockIndexing();
      });
      this.schedulerRegistry.addCronJob('indexer-transactions', job);
      job.start();
    });
  }
}
