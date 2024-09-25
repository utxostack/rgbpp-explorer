import { Logger } from '@nestjs/common';
import { AssetType, Chain } from '@prisma/client';
import { EventEmitter } from 'node:events';
import { CKB_MIN_SAFE_CONFIRMATIONS } from 'src/constants';
import { BlockchainService } from 'src/core/blockchain/blockchain.service';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { IndexerQueueService } from '../indexer.queue';

export enum IndexerAssetsEvent {
  AssetIndexed = 'asset-indexed',
  BlockAssetsIndexed = 'block-assets-indexed',
}

export class IndexerAssetsFlow extends EventEmitter {
  private readonly logger = new Logger(IndexerAssetsFlow.name);

  constructor(
    private chain: Chain,
    private blockchainService: BlockchainService,
    private prismaService: PrismaService,
    private indexerQueueService: IndexerQueueService,
  ) {
    super();
  }

  public async start() {
    const assetTypeScripts = await this.prismaService.assetType.findMany({
      where: { chainId: this.chain.id },
    });
    this.logger.log(`Indexing ${assetTypeScripts.length} asset type scripts`);
    assetTypeScripts.map((assetType) => this.indexAssets(assetType));
    this.setupAssetIndexedListener(assetTypeScripts.length);
  }

  private async indexAssets(assetType: AssetType) {
    const cursor = await this.indexerQueueService.getLatestAssetJobCursor(assetType);
    if (cursor === '0x') {
      this.emit(IndexerAssetsEvent.AssetIndexed, assetType);
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
        this.off(IndexerAssetsEvent.AssetIndexed, onAssetIndexed);
        this.startBlockAssetsIndexing();
        this.setupBlockAssetsIndexedListener();
      }
    };
    this.on(IndexerAssetsEvent.AssetIndexed, onAssetIndexed);
  }

  private async startBlockAssetsIndexing() {
    const tipBlockNumber = await this.blockchainService.getTipBlockNumber();

    let latestIndexedBlockNumber = await this.indexerQueueService.getLatestIndexedBlock(
      this.chain.id,
    );
    if (!latestIndexedBlockNumber) {
      const latestAsset = await this.prismaService.asset.findFirst({
        select: { blockNumber: true },
        where: { chainId: this.chain.id },
        orderBy: { blockNumber: 'desc' },
      });
      latestIndexedBlockNumber = latestAsset!.blockNumber;
    }
    const targetBlockNumber = tipBlockNumber - CKB_MIN_SAFE_CONFIRMATIONS;
    if (targetBlockNumber <= latestIndexedBlockNumber) {
      this.emit(IndexerAssetsEvent.BlockAssetsIndexed);
      return;
    }

    await this.indexerQueueService.addBlockAssetsJob({
      chainId: this.chain.id,
      blockNumber: latestIndexedBlockNumber + 1,
      targetBlockNumber,
    });
  }

  private setupBlockAssetsIndexedListener() {
    this.on(IndexerAssetsEvent.BlockAssetsIndexed, () => {
      setTimeout(this.startBlockAssetsIndexing.bind(this), 1000 * 10);
    });
  }
}
