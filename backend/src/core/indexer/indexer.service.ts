import { Logger } from '@nestjs/common';
import { Chain } from '@prisma/client';
import { BlockchainService } from '../blockchain/blockchain.service';
import { PrismaService } from '../database/prisma/prisma.service';
import { IndexerQueueService } from './indexer.queue';

export class IndexerService {
  private readonly logger = new Logger(IndexerService.name);

  constructor(
    private chain: Chain,
    private blockchainService: BlockchainService,
    private prismaService: PrismaService,
    private indexerQueueService: IndexerQueueService,
  ) { }

  public async indexRgbppAssets() {
    await this.indexerQueueService.moveActiveAssetsJobToDelay();
    const assetTypeScripts = await this.prismaService.assetType.findMany({
      where: { chainId: this.chain.id },
    });

    this.logger.log(`Indexing ${assetTypeScripts.length} asset type scripts`);

    await Promise.all(
      assetTypeScripts.map(async (assetType) => {
        const cursor = await this.indexerQueueService.getLatestAssetJobCursor(assetType);
        await this.indexerQueueService.addAssetJob({
          chainId: this.chain.id,
          assetType,
          cursor,
        });
      }),
    );

    await new Promise((resolve) => {
      const checkAssetsIndexProgress = async () => {
        const cursors = await Promise.all(assetTypeScripts.map(async (assetType) => {
          return this.indexerQueueService.getLatestAssetJobCursor(assetType);
        }));
        if (cursors.every((cursor) => cursor === '0x')) {
          resolve(undefined);
        } else {
          setTimeout(checkAssetsIndexProgress, 1000);
        }
      };
      checkAssetsIndexProgress();
    });
  }

  public async close() {
    this.blockchainService.close();
  }
}
