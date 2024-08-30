import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { INDEXER_ASSETS_QUEUE, IndexerAssetsJobData } from './processor/assets.processor';
import { Queue } from 'bullmq';
import { BI, HashType, Script } from '@ckb-lumos/lumos';
import { computeScriptHash } from '@ckb-lumos/lumos/utils';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { AssetType } from '@prisma/client';
import { INDEXER_BLOCK_QUEUE, IndexerBlockJobData } from './processor/block.processor';

@Injectable()
export class IndexerQueueService {
  private readonly logger = new Logger(IndexerQueueService.name);

  constructor(
    @InjectQueue(INDEXER_ASSETS_QUEUE) public assetsQueue: Queue,
    @InjectQueue(INDEXER_BLOCK_QUEUE) public blockQueue: Queue,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  public async moveActiveJobToDelay() {
    const activeAssetsJobs = await this.assetsQueue.getJobs(['active']);
    await Promise.all((activeAssetsJobs || []).map((job) => job.moveToDelayed(Date.now() + 1000)));

    const activeBlockJobs = await this.blockQueue.getJobs(['active']);
    await Promise.all((activeBlockJobs || []).map((job) => job.moveToDelayed(Date.now() + 1000)));
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
}
