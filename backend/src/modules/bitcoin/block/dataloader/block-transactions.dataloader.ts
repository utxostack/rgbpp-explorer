import DataLoader from 'dataloader';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataLoaderResponse } from 'src/common/dataloader';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import * as BitcoinApi from 'src/core/bitcoin-api/bitcoin-api.schema';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { BitcoinBaseLoader } from './base';
import * as Sentry from '@sentry/nestjs';
import { NestDataLoader } from 'src/common/dataloader';

export interface BitcoinBlockTransactionsLoaderParams {
  hash?: string;
  height?: number;
  startIndex?: number;
}

@Injectable()
export class BitcoinBlockTransactionsLoader
  extends BitcoinBaseLoader
  implements NestDataLoader<BitcoinBlockTransactionsLoaderParams, BitcoinApi.Transaction[] | null>
{
  protected logger = new Logger(BitcoinBlockTransactionsLoader.name);

  constructor(
    public bitcoinApiService: BitcoinApiService,
    @Inject(CACHE_MANAGER) public cacheManager: Cache,
  ) {
    super();
  }

  public getOptions() {
    return {
      cacheKeyFn: (key: BitcoinBlockTransactionsLoaderParams) => {
        const { hash, height, startIndex } = key;
        return `${hash || height}-${startIndex}`;
      },
    };
  }

  public getBatchFunction() {
    return async (batchProps: BitcoinBlockTransactionsLoaderParams[]) => {
      this.logger.debug(`Loading bitcoin block transactions`);
      const results = await Promise.allSettled(
        batchProps.map(async ({ hash, height, startIndex }) => {
          if (!hash && !height) {
            return null;
          }
          return this.getBlockTxs(hash || height!.toString(), startIndex);
        }),
      );
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        this.logger.error(`Requesting: ${batchProps[index]}, occurred error: ${result.reason}`);
        Sentry.captureException(result.reason);
        return null;
      });
    };
  }
}
export type BitcoinBlockTransactionsLoaderType = DataLoader<
  BitcoinBlockTransactionsLoaderParams,
  BitcoinApi.Transaction[] | null
>;
export type BitcoinBlockTransactionsLoaderResponse =
  DataLoaderResponse<BitcoinBlockTransactionsLoader>;
