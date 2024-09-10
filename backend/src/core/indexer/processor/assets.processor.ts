import { BI, HashType } from '@ckb-lumos/lumos';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { AssetType } from '@prisma/client';
import { Job } from 'bullmq';
import { BlockchainServiceFactory } from 'src/core/blockchain/blockchain.factory';
import { SearchKey } from 'src/core/blockchain/blockchain.interface';
import { IndexerQueueService } from '../indexer.queue';
import { ModuleRef } from '@nestjs/core';
import { IndexerServiceFactory } from '../indexer.factory';
import { IndexerAssetsService } from '../service/assets.service';
import { IndexerEvent } from '../indexer.service';
import * as Sentry from '@sentry/node';

export const INDEXER_ASSETS_QUEUE = 'indexer-assets-queue';

export interface IndexerAssetsJobData {
  chainId: number;
  assetType: AssetType;
  cursor?: string;
}

const BATCH_SIZE = BI.from(400).toHexString();

@Processor(INDEXER_ASSETS_QUEUE, {
  concurrency: 100,
})
export class IndexerAssetsProcessor extends WorkerHost {
  private logger = new Logger(IndexerAssetsProcessor.name);

  constructor(
    private blockchainServiceFactory: BlockchainServiceFactory,
    private moduleRef: ModuleRef,
  ) {
    super();
  }

  @OnWorkerEvent('active')
  public onActive(job: Job<IndexerAssetsJobData>) {
    const { chainId, assetType, cursor } = job.data;
    this.logger.debug(
      `Indexing assets (code hash: ${assetType.codeHash}, cursor: ${cursor}) for chain ${chainId}`,
    );
  }

  @OnWorkerEvent('completed')
  public onCompleted(job: Job<IndexerAssetsJobData>) {
    const { chainId, assetType, cursor } = job.data;
    this.logger.log(
      `Indexing assets (code hash: ${assetType.codeHash}, cursor: ${cursor}) for chain ${chainId} completed`,
    );
  }

  @OnWorkerEvent('failed')
  public onFailed(job: Job<IndexerAssetsJobData>, error: Error) {
    const { chainId, assetType, cursor } = job.data;
    this.logger.error(
      `Indexing assets (code hash: ${assetType.codeHash}, cursor: ${cursor}) for chain ${chainId} failed`,
    );
    Sentry.captureException(error);
  }

  public async process(job: Job<IndexerAssetsJobData>): Promise<any> {
    const { chainId, assetType, cursor } = job.data;
    if (cursor === '0x') {
      const indexerServiceFactory = this.moduleRef.get(IndexerServiceFactory);
      const indexerService = await indexerServiceFactory.getService(chainId);
      indexerService.emit(IndexerEvent.AssetIndexed, assetType);
      return;
    }

    const cells = await this.getLiveCells(job);

    if (cells.last_cursor) {
      const indexerQueueService = this.moduleRef.get(IndexerQueueService);
      await indexerQueueService.addAssetJob({
        chainId,
        assetType,
        cursor: cells.last_cursor,
      });
    }

    const indexerAssetsService = this.moduleRef.get(IndexerAssetsService);
    const assets = await Promise.all(
      cells.objects.map(async (cell) => {
        return indexerAssetsService.processAssetCell(chainId, cell, assetType);
      }),
    );

    return assets;
  }

  private async getLiveCells(job: Job<IndexerAssetsJobData>) {
    const { chainId, assetType, cursor } = job.data;
    const blockchainService = this.blockchainServiceFactory.getService(chainId);
    const searchKey: SearchKey = {
      script: {
        code_hash: assetType.codeHash,
        hash_type: assetType.hashType as HashType,
        args: '0x',
      },
      script_type: 'type',
    };
    const cells = await blockchainService.getCells(searchKey, 'desc', BATCH_SIZE, cursor);
    return cells;
  }
}
