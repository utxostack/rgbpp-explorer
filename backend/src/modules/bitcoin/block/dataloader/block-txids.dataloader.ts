import DataLoader from 'dataloader';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataLoaderResponse } from 'src/common/dataloader';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { BitcoinBaseLoader } from './base';
import * as Sentry from '@sentry/nestjs';
import { NestDataLoader } from 'src/common/dataloader';

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

  public getOptions() {
    return {
      cacheKeyFn: (key: BitcoinBlockTxidsLoaderParams) => {
        const { hash, height } = key;
        return `${hash || height}`;
      },
    };
  }

  public getBatchFunction() {
    return async (keys: BitcoinBlockTxidsLoaderParams[]) => {
      this.logger.debug(`Loading bitcoin block transactions`);
      const results = await Promise.allSettled(
        keys.map(async ({ hash, height }) => {
          if (!hash && !height) {
            return null;
          }
          return this.getBlockTxids(hash || height!.toString());
        }),
      );
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        this.logger.error(`Requesting: ${keys[index]}, occurred error: ${result.reason}`);
        Sentry.captureException(result.reason);
        return null;
      });
    };
  }
}
export type BitcoinBlockTxidsLoaderType = DataLoader<
  BitcoinBlockTxidsLoaderParams,
  string[] | null
>;
export type BitcoinBlockTxidsLoaderResponse = DataLoaderResponse<BitcoinBlockTxidsLoader>;
