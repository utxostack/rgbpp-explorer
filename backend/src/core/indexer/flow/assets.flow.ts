import { Logger } from '@nestjs/common';
import { AssetType, Chain } from '@prisma/client';
import { CKB_MIN_SAFE_CONFIRMATIONS } from 'src/constants';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { IndexerQueueService } from '../indexer.queue';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BlockchainService } from 'src/core/blockchain/blockchain.service';

export class IndexerAssetsFlow {
  private readonly logger = new Logger(IndexerAssetsFlow.name);

  public static readonly Event = {
    AssetIndexed: 'asset-indexed',
  };

  constructor(
    private chain: Chain,
    private indexerQueueService: IndexerQueueService,
    private blockchainService: BlockchainService,
    private prismaService: PrismaService,
    private schedulerRegistry: SchedulerRegistry,
    public eventEmitter: EventEmitter2,
  ) { }

  private async getLatestAssetBlockNumber() {
    const latestAsset = await this.prismaService.asset.findFirst({
      select: { blockNumber: true },
      where: { chainId: this.chain.id },
      orderBy: { blockNumber: 'desc' },
    });
    return latestAsset?.blockNumber ?? -1;
  }

  public async start() {
    const assetTypeScripts = await this.prismaService.assetType.findMany({
      where: { chainId: this.chain.id },
    });
    this.logger.log(`Indexing ${assetTypeScripts.length} asset type scripts`);
    this.setupAssetIndexedListener(assetTypeScripts.length);
    assetTypeScripts.map((assetType) => this.startAssetsIndexing(assetType));
  }

  private async startAssetsIndexing(assetType: AssetType) {
    const cursor = await this.indexerQueueService.getLatestAssetJobCursor(assetType);
    if (cursor === '0x') {
      this.eventEmitter.emit(IndexerAssetsFlow.Event.AssetIndexed, assetType);
      return;
    }
    await this.indexerQueueService.addAssetJob({
      chainId: this.chain.id,
      assetType,
      cursor,
    });
  }

  private setupAssetIndexedListener(totalAssetTypes: number) {
    let completed = 0;
    const onAssetIndexed = async (assetType: AssetType) => {
      completed += 1;
      this.logger.log(`Asset type ${assetType.codeHash} indexed`);
      if (completed === totalAssetTypes) {
        this.eventEmitter.off(IndexerAssetsFlow.Event.AssetIndexed, onAssetIndexed);
        this.startBlockAssetsIndexing();
      }
    };
    this.eventEmitter.on(IndexerAssetsFlow.Event.AssetIndexed, onAssetIndexed);
  }

  private async startBlockAssetsIndexing() {
    const tipBlockNumber = await this.blockchainService.getTipBlockNumber();

    let latestIndexedBlockNumber = await this.indexerQueueService.getLatestIndexedAssetsBlock(
      this.chain.id,
    );
    if (!latestIndexedBlockNumber) {
      latestIndexedBlockNumber = await this.getLatestAssetBlockNumber();
    }
    const targetBlockNumber = tipBlockNumber - CKB_MIN_SAFE_CONFIRMATIONS;
    if (targetBlockNumber <= latestIndexedBlockNumber) {
      this.logger.log(`Block assets are up to date: ${latestIndexedBlockNumber}`);
    } else {
      await this.indexerQueueService.addBlockAssetsJob({
        chainId: this.chain.id,
        blockNumber: latestIndexedBlockNumber + 1,
        targetBlockNumber,
      });
    }
    this.setupBlockAssetsCronJob();
  }

  private setupBlockAssetsCronJob() {
    const cronJobName = `indexer-block-assets-${this.chain.id}-${process.pid}`;
    if (this.schedulerRegistry.doesExist('cron', cronJobName)) {
      return;
    }

    this.logger.log(`Scheduling block assets indexing cron job`);
    const job = new CronJob(CronExpression.EVERY_10_SECONDS, () => {
      this.startBlockAssetsIndexing();
    });
    this.schedulerRegistry.addCronJob(cronJobName, job);
    job.start();
  }
}
