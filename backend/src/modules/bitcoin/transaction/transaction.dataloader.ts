import DataLoader from 'dataloader';
import { Injectable, Logger } from '@nestjs/common';
import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import * as BitcoinApi from 'src/core/bitcoin-api/bitcoin-api.schema';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import { DataLoaderResponse } from 'src/common/type/dataloader';

@Injectable()
export class BitcoinTransactionLoader
  implements NestDataLoader<string, BitcoinApi.Transaction | null>
{
  private logger = new Logger(BitcoinTransactionLoader.name);

  constructor(private bitcoinApiService: BitcoinApiService) {}

  public getBatchFunction() {
    return async (ids: string[]) => {
      this.logger.debug(`Loading bitcoin transactions: ${ids.join(', ')}`);
      const results = await Promise.allSettled(
        ids.map((key) => this.bitcoinApiService.getTx({ txid: key })),
      );
      return results.map((result) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        return null;
      });
    };
  }
}
export type BitcoinTransactionLoaderType = DataLoader<string, BitcoinApi.Transaction | null>;
export type BitcoinTransactionLoaderResponse = DataLoaderResponse<BitcoinTransactionLoader>;

@Injectable()
export class BitcoinTransactionOutSpendsLoader
  implements NestDataLoader<string, BitcoinApi.OutSpend[]>
{
  private logger = new Logger(BitcoinTransactionLoader.name);

  constructor(private bitcoinApiService: BitcoinApiService) {}

  public getBatchFunction() {
    return async (txids: string[]) => {
      this.logger.debug(`Loading bitcoin transactions: ${txids.join(', ')}`);
      return Promise.all(
        txids.map(async (txid) => this.bitcoinApiService.getTxOutSpends({ txid: txid })),
      );
    };
  }
}
export type BitcoinTransactionOutSpendsLoaderType = DataLoader<string, BitcoinApi.OutSpend[]>;
export type BitcoinTransactionOutSpendsLoaderResponse =
  DataLoaderResponse<BitcoinTransactionOutSpendsLoader>;
