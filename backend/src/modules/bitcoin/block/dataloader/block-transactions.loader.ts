import DataLoader from 'dataloader';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import { DataLoaderResponse } from 'src/common/type/dataloader';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import * as BitcoinApi from 'src/core/bitcoin-api/bitcoin-api.schema';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { BitcoinBaseLoader } from './base';

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

  public getBatchFunction() {
    return async (batchProps: BitcoinBlockTransactionsLoaderParams[]) => {
      this.logger.debug(`Loading bitcoin block transactions`);
      const results = await Promise.allSettled(
        batchProps.map(async ({ hash, height, startIndex }) =>
          this.getBlockTxs(hash || height.toString(), startIndex),
        ),
      );
      return results.map((result) => (result.status === 'fulfilled' ? result.value : null));
    };
  }
}
export type BitcoinBlockTransactionsLoaderType = DataLoader<
  BitcoinBlockTransactionsLoaderParams,
  BitcoinApi.Transaction[] | null
>;
export type BitcoinBlockTransactionsLoaderResponse =
  DataLoaderResponse<BitcoinBlockTransactionsLoader>;

