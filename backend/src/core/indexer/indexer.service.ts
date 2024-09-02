import { Logger } from '@nestjs/common';
import { AssetType, Chain } from '@prisma/client';
import { BlockchainService } from '../blockchain/blockchain.service';
import { PrismaService } from '../database/prisma/prisma.service';
import { IndexerQueueService } from './indexer.queue';
import { EventEmitter } from 'node:events';
import { CKB_MIN_SAFE_CONFIRMATIONS } from 'src/constants';

export enum IndexerEvent {
  AssetIndexed = 'asset-indexed',
  BlockIndexed = 'block-indexed',
}

export class IndexerService extends EventEmitter {
  private readonly logger = new Logger(IndexerService.name);

  constructor(
    private chain: Chain,
    private blockchainService: BlockchainService,
    private prismaService: PrismaService,
    private indexerQueueService: IndexerQueueService,
  ) {
    super();
  }

  public async startAssetsIndexing() {
    await this.indexerQueueService.moveActiveJobToDelay();
    const assetTypeScripts = await this.prismaService.assetType.findMany({
      where: { chainId: this.chain.id },
    });
    this.logger.log(`Indexing ${assetTypeScripts.length} asset type scripts`);
    assetTypeScripts.map((assetType) => this.indexAssets(assetType));
    this.setupAssetIndexedListener(assetTypeScripts.length);
  }

  public async close() {
    this.blockchainService.close();
  }

  private async indexAssets(assetType: AssetType) {
    const cursor = await this.indexerQueueService.getLatestAssetJobCursor(assetType);
    if (cursor === '0x') {
      this.emit(IndexerEvent.AssetIndexed, assetType);
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
        this.off(IndexerEvent.AssetIndexed, onAssetIndexed);
        this.startBlockIndexing();
        this.setupBlockIndexedListener();
      }
    };
    this.on(IndexerEvent.AssetIndexed, onAssetIndexed);
  }

  private async startBlockIndexing() {
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
      this.emit(IndexerEvent.BlockIndexed);
      return;
    }

    await this.indexerQueueService.addBlockJob({
      chainId: this.chain.id,
      blockNumber: latestIndexedBlockNumber + 1,
      targetBlockNumber,
    });
  }

  private setupBlockIndexedListener() {
    this.on(IndexerEvent.BlockIndexed, () => {
      setTimeout(() => {
        this.startBlockIndexing();
      }, 1000 * 10);
    });
  }
}
