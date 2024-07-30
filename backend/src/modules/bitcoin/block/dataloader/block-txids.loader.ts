import DataLoader from 'dataloader';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import { DataLoaderResponse } from 'src/common/type/dataloader';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { BitcoinBaseLoader } from './base';

export interface BitcoinBlockTxidsLoaderParams {
  hash?: string;
  height?: number;
}

@Injectable()
export class BitcoinBlockTxidsLoader
  extends BitcoinBaseLoader
  implements NestDataLoader<BitcoinBlockTxidsLoaderParams, string[] | null>
{
  protected logger = new Logger(BitcoinBlockTxidsLoader.name);

  constructor(
    public bitcoinApiService: BitcoinApiService,
    @Inject(CACHE_MANAGER) public cacheManager: Cache,
  ) {
    super();
  }

  public getBatchFunction() {
    return async (keys: BitcoinBlockTxidsLoaderParams[]) => {
      this.logger.debug(`Loading bitcoin block transactions`);
      const results = await Promise.allSettled(
        keys.map(async ({ hash, height }) => this.getBlockTxids(hash || height.toString())),
      );
      return results.map((result) => (result.status === 'fulfilled' ? result.value : null));
    };
  }
}
export type BitcoinBlockTxidsLoaderType = DataLoader<BitcoinBlockTxidsLoaderParams, string[]>;
export type BitcoinBlockTxidsLoaderResponse = DataLoaderResponse<BitcoinBlockTxidsLoader>;
