import { BI } from '@ckb-lumos/bi';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Job } from 'bullmq';
import { BlockchainServiceFactory } from 'src/core/blockchain/blockchain.factory';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { IndexerQueueService } from '../indexer.queue';
import { IndexerAssetsService } from '../service/assets.service';
import { Cell, Transaction } from 'src/core/blockchain/blockchain.interface';
import { IndexerServiceFactory } from '../indexer.factory';
import * as Sentry from '@sentry/node';
import { IndexerAssetsEvent } from '../flow/assets.flow';

export const INDEXER_BLOCK_ASSETS_QUEUE = 'indexer-block-assets-queue';

export interface IndexerBlockAssetsJobData {
  chainId: number;
  blockNumber: number;
  targetBlockNumber: number;
}

@Processor(INDEXER_BLOCK_ASSETS_QUEUE, {
  stalledInterval: 60_000,
  useWorkerThreads: true,
})
export class IndexerBlockAssetsProcessor extends WorkerHost {
  private logger = new Logger(IndexerBlockAssetsProcessor.name);

  constructor(
    private blockchainServiceFactory: BlockchainServiceFactory,
    private prismaService: PrismaService,
    private moduleRef: ModuleRef,
  ) {
    super();
  }

  @OnWorkerEvent('active')
  public onActive(job: Job<IndexerBlockAssetsJobData>) {
    const { chainId, blockNumber } = job.data;
    this.logger.debug(`Indexing block ${blockNumber} assets for chain ${chainId}`);
  }

  @OnWorkerEvent('completed')
  public onCompleted(job: Job<IndexerBlockAssetsJobData>) {
    const { chainId, blockNumber } = job.data;
    this.logger.log(`Indexing block ${blockNumber} assets for chain ${chainId} completed`);
  }

  @OnWorkerEvent('failed')
  public onFailed(job: Job<IndexerBlockAssetsJobData>, error: Error) {
    const { chainId, blockNumber } = job.data;
    this.logger.error(`Indexing block ${blockNumber} assets for chain ${chainId} failed`);
    this.logger.error(error.stack);
    Sentry.captureException(error);
  }

  public async process(job: Job<IndexerBlockAssetsJobData>): Promise<any> {
    const { chainId, blockNumber, targetBlockNumber } = job.data;
    const block = await this.getBlock(job);

    const assetTypeScripts = await this.prismaService.assetType.findMany({ where: { chainId } });
    await Promise.all(
      block.transactions.map(async (tx, txIndex) => {
        await job.updateProgress((txIndex / block.transactions.length) * 100);
        await this.updateInputAssetCellStatus(chainId, tx);

        for (let index = 0; index < tx.outputs.length; index += 1) {
          const output = tx.outputs[index];
          if (!output.type) {
            continue;
          }

          const assetType = assetTypeScripts.find((assetType) => {
            return (
              assetType.codeHash === output.type!.code_hash &&
              assetType.hashType === output.type!.hash_type
            );
          });
          if (!assetType) {
            continue;
          }

          const indexerAssetsService = this.moduleRef.get(IndexerAssetsService);
          const cell: Cell = {
            block_number: block.header.number,
            out_point: {
              index: BI.from(index).toHexString(),
              tx_hash: tx.hash,
            },
            output,
            output_data: tx.outputs_data[index],
            tx_index: BI.from(txIndex).toHexString(),
          };
          await indexerAssetsService.processAssetCell(chainId, cell, assetType);
        }
      }),
    );

    if (blockNumber < targetBlockNumber) {
      const indexerQueueService = this.moduleRef.get(IndexerQueueService);
      await indexerQueueService.addBlockAssetsJob({
        chainId,
        blockNumber: blockNumber + 1,
        targetBlockNumber,
      });
    } else {
      const indexerServiceFactory = this.moduleRef.get(IndexerServiceFactory);
      const indexerService = await indexerServiceFactory.getService(chainId);
      indexerService.assetsFlow.emit(IndexerAssetsEvent.BlockAssetsIndexed, block);
      return;
    }
  }

  private async updateInputAssetCellStatus(chainId: number, tx: Transaction) {
    for (const input of tx.inputs) {
      const existingAsset = await this.prismaService.asset.findUnique({
        where: {
          chainId_txHash_index: {
            chainId: chainId,
            txHash: input.previous_output.tx_hash,
            index: input.previous_output.index,
          },
        },
      });
      if (!existingAsset) {
        continue;
      }

      await this.prismaService.asset.update({
        where: {
          chainId_txHash_index: {
            chainId: chainId,
            txHash: input.previous_output.tx_hash,
            index: input.previous_output.index,
          },
        },
        data: {
          isLive: false,
        },
      });
    }
  }

  private async getBlock(job: Job<IndexerBlockAssetsJobData>) {
    const { chainId, blockNumber } = job.data;
    const blockchainService = this.blockchainServiceFactory.getService(chainId);
    const block = await blockchainService.getBlockByNumber(BI.from(blockNumber).toHexString());
    return block;
  }
}
