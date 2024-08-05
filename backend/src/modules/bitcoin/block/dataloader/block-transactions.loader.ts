import DataLoader from 'dataloader';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import { DataLoaderResponse } from 'src/common/type/dataloader';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import * as BitcoinApi from 'src/core/bitcoin-api/bitcoin-api.schema';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { BitcoinBaseLoader } from './base';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';

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
    @InjectSentry() private sentryService: SentryService,
  ) {
    super();
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
        this.sentryService.instance().captureException(result.reason);
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
