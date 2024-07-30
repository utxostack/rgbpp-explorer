import DataLoader from 'dataloader';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import { DataLoaderResponse } from 'src/common/type/dataloader';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import * as BitcoinApi from 'src/core/bitcoin-api/bitcoin-api.schema';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { BitcoinBaseLoader } from './base';

@Injectable()
export class BitcoinBlockLoader
  extends BitcoinBaseLoader
  implements NestDataLoader<string, BitcoinApi.Block | null>
{
  protected logger = new Logger(BitcoinBlockLoader.name);

  constructor(
    public bitcoinApiService: BitcoinApiService,
    @Inject(CACHE_MANAGER) public cacheManager: Cache,
  ) {
    super();
  }

  public getBatchFunction() {
    return async (keys: string[]) => {
      this.logger.debug(`Loading bitcoin blocks: ${keys.join(', ')}`);
      const results = await Promise.allSettled(keys.map(async (key) => this.getBlock(key)));
      return results.map((result) => (result.status === 'fulfilled' ? result.value : null));
    };
  }
}
export type BitcoinBlockLoaderType = DataLoader<string, BitcoinApi.Block | null>;
export type BitcoinBlockLoaderResponse = DataLoaderResponse<BitcoinBlockLoader>;

