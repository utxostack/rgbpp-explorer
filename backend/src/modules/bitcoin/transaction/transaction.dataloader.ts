import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import { Injectable, Logger } from '@nestjs/common';
import * as BitcoinApi from 'src/core/bitcoin-api/bitcoin-api.schema';
import { DataLoaderResponse } from 'src/common/type/dataloader';
import { BitcoinAPIService } from 'src/core/bitcoin-api/bitcoin-api.service';

@Injectable()
export class BitcoinTransactionLoader implements NestDataLoader<string, BitcoinApi.Transaction | null> {
  private logger = new Logger(BitcoinTransactionLoader.name);

  constructor(private bitcoinApiService: BitcoinAPIService) { }

  public getBatchFunction() {
    return async (ids: string[]) => {
      this.logger.debug(`Loading bitcoin transactions: ${ids.join(', ')}`);
      const results = await Promise.allSettled(ids.map((key) => this.bitcoinApiService.getTx({ txid: key })));
      return results.map((result) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        return null;
      });
    };
  }
}
export type BitcoinTransactionLoaderResponse = DataLoaderResponse<BitcoinTransactionLoader>;
