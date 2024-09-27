import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { INDEXER_ASSETS_QUEUE, IndexerAssetsJobData } from './processor/assets.processor';
import { Queue } from 'bullmq';
import { HashType, Script } from '@ckb-lumos/lumos';
import { computeScriptHash } from '@ckb-lumos/lumos/utils';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { AssetType } from '@prisma/client';
import {
  INDEXER_BLOCK_ASSETS_QUEUE,
  IndexerBlockAssetsJobData,
} from './processor/block-assets.processor';
import { INDEXER_LOCK_QUEUE, IndexerLockJobData } from './processor/lock.processor';
import { INDEXER_TYPE_QUEUE, IndexerTypeJobData } from './processor/type.processor';
import { INDEXER_BLOCK_QUEUE, IndexerBlockJobData } from './processor/block.processor';
import {
  INDEXER_TRANSACTION_QUEUE,
  IndexerTransactionJobData,
} from './processor/transaction.processor';

@Injectable()
export class IndexerQueueService {
  private readonly logger = new Logger(IndexerQueueService.name);

  constructor(
    @InjectQueue(INDEXER_ASSETS_QUEUE) public assetsQueue: Queue,
    @InjectQueue(INDEXER_BLOCK_ASSETS_QUEUE) public blockAssetsQueue: Queue,
    @InjectQueue(INDEXER_LOCK_QUEUE) public lockQueue: Queue,
    @InjectQueue(INDEXER_TYPE_QUEUE) public typeQueue: Queue,
    @InjectQueue(INDEXER_BLOCK_QUEUE) public blockQueue: Queue,
    @InjectQueue(INDEXER_TRANSACTION_QUEUE) public transactionQueue: Queue,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  public async moveActiveJobToDelay() {
    await Promise.all([
      this.assetsQueue.getJobs(['active']),
      this.blockAssetsQueue.getJobs(['active']),
      this.lockQueue.getJobs(['active']),
      this.typeQueue.getJobs(['active']),
      this.blockQueue.getJobs(['active']),
      this.transactionQueue.getJobs(['active']),
    ]).then(async (jobs) => {
      await Promise.all(jobs.flat().map((job) => job.moveToDelayed(Date.now() + 1000)));
    });
  }

  public async getLatestAssetJobCursor(assetType: AssetType) {
    const script: Script = {
      codeHash: assetType.codeHash,
      hashType: assetType.hashType as HashType,
      args: '0x',
    };
    const typeHash = computeScriptHash(script);
    const key = `${INDEXER_ASSETS_QUEUE}:${typeHash}`;
    return this.cacheManager.get<string>(key);
  }

  public async addAssetJob(data: IndexerAssetsJobData) {
    const { chainId, assetType, cursor } = data;
    const script: Script = {
      codeHash: assetType.codeHash,
      hashType: assetType.hashType as HashType,
      args: '0x',
    };
    const typeHash = computeScriptHash(script);
    const params = new URLSearchParams();
    params.append('jobType', 'index-asset');
    params.append('chainId', chainId.toString());
    params.append('typeHash', typeHash);
    params.append('cursor', cursor || '');
    const jobId = params.toString();

    this.logger.debug(`Added asset job ${jobId} for chain ${chainId} with cursor ${cursor}`);
    await this.assetsQueue.add(jobId, data, { jobId });
    await this.cacheManager.set(`${INDEXER_ASSETS_QUEUE}:${typeHash}`, cursor || '');
  }

  public async getLatestIndexedAssetsBlock(chainId: number) {
    const blockNumber = await this.cacheManager.get<number>(
      `${INDEXER_BLOCK_ASSETS_QUEUE}:${chainId}`,
    );
    return blockNumber;
  }

  public async setLatestIndexedAssetsBlock(chainId: number, blockNumber: number) {
    await this.cacheManager.set(`${INDEXER_BLOCK_ASSETS_QUEUE}:${chainId}`, blockNumber);
  }

  public async addBlockAssetsJob(data: IndexerBlockAssetsJobData) {
    const { chainId, blockNumber } = data;
    const params = new URLSearchParams();
    params.append('jobType', 'index-block-assets');
    params.append('chainId', chainId.toString());
    params.append('blockNumber', blockNumber.toString());
    const jobId = params.toString();

    this.logger.debug(
      `Added block assets job ${jobId} for chain ${chainId} with block number ${blockNumber}`,
    );
    await this.blockAssetsQueue.add(jobId, data, { jobId });
    await this.setLatestIndexedAssetsBlock(chainId, blockNumber);
  }

  public async addLockJob(data: IndexerLockJobData) {
    const { chainId, script } = data;
    const params = new URLSearchParams();
    params.append('jobType', 'index-lock');
    params.append('chainId', chainId.toString());
    params.append('script', computeScriptHash(script));
    const jobId = params.toString();

    this.logger.debug(
      `Added lock job ${jobId} for chain ${chainId} with script hash ${computeScriptHash(script)}`,
    );
    await this.lockQueue.add(jobId, data, { jobId });
  }

  public async addTypeJob(data: IndexerTypeJobData) {
    const { chainId, script } = data;
    const params = new URLSearchParams();
    params.append('jobType', 'index-type');
    params.append('chainId', chainId.toString());
    params.append('script', computeScriptHash(script));
    const jobId = params.toString();

    this.logger.debug(
      `Added type job ${jobId} for chain ${chainId} with script hash ${computeScriptHash(script)}`,
    );
    await this.typeQueue.add(jobId, data, { jobId });
  }

  public async addBlockJob(data: IndexerBlockJobData) {
    const { chainId, blockNumber } = data;
    const params = new URLSearchParams();
    params.append('jobType', 'index-block');
    params.append('chainId', chainId.toString());
    params.append('blockNumber', blockNumber.toString());
    const jobId = params.toString();

    this.logger.debug(
      `Added block job ${jobId} for chain ${chainId} with block number ${blockNumber}`,
    );
    await this.blockQueue.add(jobId, data, { jobId });
  }

  public async addTransactionJob(data: IndexerTransactionJobData) {
    const { chainId, transaction } = data;
    const params = new URLSearchParams();
    params.append('jobType', 'index-transaction');
    params.append('chainId', chainId.toString());
    params.append('txHash', transaction.hash);
    const jobId = params.toString();
    this.logger.debug(
      `Added transaction job ${jobId} for chain ${chainId} with tx hash ${transaction.hash}`,
    );
    await this.transactionQueue.add(jobId, data, { jobId });
  }
}
