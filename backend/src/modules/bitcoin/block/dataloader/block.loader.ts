import DataLoader from 'dataloader';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import { DataLoaderResponse } from 'src/common/type/dataloader';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import * as BitcoinApi from 'src/core/bitcoin-api/bitcoin-api.schema';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { BitcoinBaseLoader } from './base';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';

@Injectable()
export class BitcoinBlockLoader
  extends BitcoinBaseLoader
  implements NestDataLoader<string, BitcoinApi.Block | void>
{
  protected logger = new Logger(BitcoinBlockLoader.name);

  constructor(
    public bitcoinApiService: BitcoinApiService,
    @Inject(CACHE_MANAGER) public cacheManager: Cache,
    @InjectSentry() private sentryService: SentryService,
  ) {
    super();
  }

  public getBatchFunction() {
    return async (keys: string[]) => {
      this.logger.debug(`Loading bitcoin blocks: ${keys.join(', ')}`);
      const results = await Promise.allSettled(keys.map(async (key) => this.getBlock(key)));
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        if (result.reason instanceof Error) {
          this.logger.error(`Requesting: ${keys[index]}, occurred error: ${result.reason}`);
          this.sentryService.instance().captureException(result.reason);
        }
      });
    };
  }
}
export type BitcoinBlockLoaderType = DataLoader<string, BitcoinApi.Block | void>;
export type BitcoinBlockLoaderResponse = DataLoaderResponse<BitcoinBlockLoader>;
