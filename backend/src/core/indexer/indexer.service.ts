import { Logger } from '@nestjs/common';
import { AssetType, Chain } from '@prisma/client';
import { BlockchainService } from '../blockchain/blockchain.service';
import { PrismaService } from '../database/prisma/prisma.service';
import { IndexerQueueService } from './indexer.queue';
import { EventEmitter } from 'node:events';
import { CKB_MIN_SAFE_CONFIRMATIONS } from 'src/constants';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

export class IndexerService extends EventEmitter {
  private readonly logger = new Logger(IndexerService.name);
  private isBlockIndexing = false;

  constructor(
    private chain: Chain,
    private blockchainService: BlockchainService,
    private prismaService: PrismaService,
    private indexerQueueService: IndexerQueueService,
    private schedulerRegistry: SchedulerRegistry,
  ) {
    super();

    this.on('block-indexed', async () => {
      this.isBlockIndexing = false;
      if (this.schedulerRegistry.doesExist('cron', 'block-index-cron-job')) {
        return;
      }

      this.logger.log('Block indexed, add cron job to index next block');
      this.schedulerRegistry.addCronJob(
        'block-index-cron-job',
        new CronJob(CronExpression.EVERY_10_SECONDS, async () => {
          this.logger.log('Start block indexing');
          this.startBlockIndexing();
        }),
      );
    });
  }

  public async startAssetsIndexing() {
    await this.indexerQueueService.moveActiveJobToDelay();
    const assetTypeScripts = await this.prismaService.assetType.findMany({
      where: { chainId: this.chain.id },
    });

    this.logger.log(`Indexing ${assetTypeScripts.length} asset type scripts`);
    assetTypeScripts.map(async (assetType) => {
      const cursor = await this.indexerQueueService.getLatestAssetJobCursor(assetType);
      if (cursor === '0x') {
        this.emit('asset-indexed', assetType);
        return;
      }
      await this.indexerQueueService.addAssetJob({
        chainId: this.chain.id,
        assetType,
        cursor,
      });
    });

    let completed = 0;
    const onAssetIndexed = async (assetType: AssetType) => {
      completed += 1;
      this.logger.log(`Asset type ${assetType.codeHash} indexed`);
      if (completed === assetTypeScripts.length) {
        this.off('asset-indexed', onAssetIndexed);
        this.startBlockIndexing();
      }
    };
    this.on('asset-indexed', onAssetIndexed);
  }

  public async close() {
    this.blockchainService.close();
  }

  private async startBlockIndexing() {
    if (this.isBlockIndexing) {
      this.logger.warn('Block indexing is already started or in progress, skip...');
      return;
    }

    const tipBlockNumber = await this.blockchainService.getTipBlockNumber();
    const latestAsset = await this.prismaService.asset.findFirst({
      select: { blockNumber: true },
      where: { chainId: this.chain.id },
      orderBy: { blockNumber: 'desc' },
    });
    const targetBlockNumber = tipBlockNumber - CKB_MIN_SAFE_CONFIRMATIONS;
    if (targetBlockNumber <= latestAsset!.blockNumber) {
      this.logger.log('No new block to index, skip...');
      return;
    }

    await this.indexerQueueService.addBlockJob({
      chainId: this.chain.id,
      blockNumber: latestAsset!.blockNumber + 1,
      targetBlockNumber,
    });
  }
}
