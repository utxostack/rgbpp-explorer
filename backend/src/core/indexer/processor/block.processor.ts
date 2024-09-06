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
import { PrismaClient } from '@prisma/client';
import { ITXClientDenyList } from '@prisma/client/runtime/library';
import { IndexerServiceFactory } from '../indexer.factory';
import { IndexerEvent } from '../indexer.service';

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
    this.logger.error(error);
  }

  public async process(job: Job<IndexerBlockJobData>): Promise<any> {
    const { chainId, blockNumber, targetBlockNumber } = job.data;
    const block = await this.getBlock(job);

    const assetTypeScripts = await this.prismaService.assetType.findMany({ where: { chainId } });
    await Promise.all(
      block.transactions.map(async (tx, txIndex) => {
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
      await indexerQueueService.addBlockJob({
        chainId,
        blockNumber: blockNumber + 1,
        targetBlockNumber,
      });
    } else {
      const indexerServiceFactory = this.moduleRef.get(IndexerServiceFactory);
      const indexerService = await indexerServiceFactory.getService(chainId);
      indexerService.emit(IndexerEvent.BlockIndexed, block);
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

  private async getBlock(job: Job<IndexerBlockJobData>) {
    const { chainId, blockNumber } = job.data;
    const blockchainService = this.blockchainServiceFactory.getService(chainId);
    const block = await blockchainService.getBlockByNumber(BI.from(blockNumber).toHexString());
    return block;
  }
}
