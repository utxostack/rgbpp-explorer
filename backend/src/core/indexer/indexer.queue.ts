import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { INDEXER_ASSETS_QUEUE, IndexerAssetsJobData } from './processor/assets.processor';
import { Queue } from 'bullmq';
import { HashType, Script } from '@ckb-lumos/lumos';
import { computeScriptHash } from '@ckb-lumos/lumos/utils';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { AssetType } from '@prisma/client';

@Injectable()
export class IndexerQueueService {
  private readonly logger = new Logger(IndexerQueueService.name);

  constructor(
    @InjectQueue(INDEXER_ASSETS_QUEUE) public assetsQueue: Queue,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  public async moveActiveAssetsJobToDelay() {
    const activeJobs = await this.assetsQueue.getJobs(['active']);
    await Promise.all((activeJobs || []).map((job) => job.moveToDelayed(Date.now() + 1000)));
  }

  public async getLatestAssetJobCursor(assetType: AssetType) {
    const script: Script = {
      codeHash: assetType.codeHash,
      hashType: assetType.hashType as HashType,
      args: '0x',
    };
    const typeHash = computeScriptHash(script);
    return this.cacheManager.get<string>(`${INDEXER_ASSETS_QUEUE}:${typeHash}`);
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

    await this.assetsQueue.add(jobId, data, {
      jobId,
    });
    await this.cacheManager.set(`${INDEXER_ASSETS_QUEUE}:${typeHash}`, cursor || '');
    this.logger.debug(`Added asset job ${jobId} for chain ${chainId} with cursor ${cursor}`);
  }
}
