import { BI, HashType, Script } from '@ckb-lumos/lumos';
import { computeScriptHash } from '@ckb-lumos/lumos/utils';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, OnModuleInit } from '@nestjs/common';
import { AssetType } from '@prisma/client';
import { Job } from 'bullmq';
import { BlockchainServiceFactory } from 'src/core/blockchain/blockchain.factory';
import { SearchKey } from 'src/core/blockchain/blockchain.interface';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { IndexerQueueService } from '../indexer.queue';
import { ModuleRef } from '@nestjs/core';

export const INDEXER_ASSETS_QUEUE = 'indexer-assets-queue';

export interface IndexerAssetsJobData {
  chainId: number;
  assetType: AssetType;
  cursor?: string;
}

const BATCH_SIZE = BI.from(1000).toHexString();

@Processor(INDEXER_ASSETS_QUEUE)
export class IndexerAssetsProcessor extends WorkerHost implements OnModuleInit {
  private logger = new Logger(IndexerAssetsProcessor.name);

  constructor(
    private blockchainServiceFactory: BlockchainServiceFactory,
    private prismaService: PrismaService,
    private moduleRef: ModuleRef,
  ) {
    super();
  }
  onModuleInit() {
    this.worker.concurrency = 100;
    this.worker.opts.useWorkerThreads = true;
  }

  @OnWorkerEvent('active')
  public onActive(job: Job<IndexerAssetsJobData>) {
    const { chainId } = job.data;
    this.logger.log(`Indexing assets for chain ${chainId} with job id: ${job.id}`);
  }

  @OnWorkerEvent('completed')
  public onCompleted(job: Job<IndexerAssetsJobData>) {
    const { chainId } = job.data;
    this.logger.log(`Indexing assets for chain ${chainId} completed with job id: ${job.id}`);
  }

  @OnWorkerEvent('failed')
  public onFailed(job: Job<IndexerAssetsJobData>, error: Error) {
    const { chainId } = job.data;
    this.logger.error(`Indexing assets for chain ${chainId} failed with job id: ${job.id}`);
    this.logger.error(JSON.stringify(job.data));
    this.logger.error(error);
  }

  public async process(job: Job<IndexerAssetsJobData>, token?: string): Promise<any> {
    const { chainId, assetType, cursor } = job.data;
    const cells = await this.getLiveCells(job);

    if (cells.last_cursor) {
      const indexerQueueService = this.moduleRef.get(IndexerQueueService);
      await indexerQueueService.addAssetJob({
        chainId,
        assetType,
        cursor: cells.last_cursor,
      });
    }

    await this.prismaService.$transaction(async (tx) => {
      const assets = await Promise.all(
        cells.objects.map(async (cell) => {
          const { out_point, output, block_number } = cell;
          const lock: Script = {
            codeHash: output.lock.code_hash,
            hashType: output.lock.hash_type as HashType,
            args: output.lock.args,
          };

          const type: Script = {
            codeHash: output.type!.code_hash,
            hashType: output.type!.hash_type as HashType,
            args: output.type!.args,
          };

          const data = {
            chainId,
            blockNumber: BI.from(block_number).toNumber(),
            txHash: out_point.tx_hash,
            index: out_point.index,
            lockScriptHash: computeScriptHash(lock),
            typeScriptHash: computeScriptHash(type),
            assetTypeId: assetType.id,
          };

          return tx.asset.upsert({
            where: {
              chainId_txHash_index: {
                chainId,
                txHash: out_point.tx_hash,
                index: out_point.index,
              },
            },
            create: data,
            update: {},
          });
        }),
      );

      return assets;
    });
  }

  private async getLiveCells(job: Job<IndexerAssetsJobData>) {
    const { chainId, assetType, cursor } = job.data;
    const blockchainService = await this.blockchainServiceFactory.getService(chainId);
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
