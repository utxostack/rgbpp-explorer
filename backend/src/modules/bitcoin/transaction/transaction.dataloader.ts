import DataLoader from 'dataloader';
import { Injectable, Logger } from '@nestjs/common';
import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import * as BitcoinApi from 'src/core/bitcoin-api/bitcoin-api.schema';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import { DataLoaderResponse } from 'src/common/type/dataloader';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';

@Injectable()
export class BitcoinTransactionLoader
  implements NestDataLoader<string, BitcoinApi.Transaction | null>
{
  private logger = new Logger(BitcoinTransactionLoader.name);

  constructor(
    private bitcoinApiService: BitcoinApiService,
    @InjectSentry() private sentryService: SentryService,
  ) {}

  public getBatchFunction() {
    return async (ids: string[]) => {
      this.logger.debug(`Loading bitcoin transactions: ${ids.join(', ')}`);
      const results = await Promise.allSettled(
        ids.map((key) => this.bitcoinApiService.getTx({ txid: key })),
      );
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        this.logger.error(`Requesting: ${ids[index]}, occurred error: ${result.reason}`);
        this.sentryService.instance().captureException(result.reason);
        return null;
      });
    };
  }
}
export type BitcoinTransactionLoaderType = DataLoader<string, BitcoinApi.Transaction | null>;
export type BitcoinTransactionLoaderResponse = DataLoaderResponse<BitcoinTransactionLoader>;

@Injectable()
export class BitcoinTransactionOutSpendsLoader
  implements NestDataLoader<string, BitcoinApi.OutSpend[] | null>
{
  private logger = new Logger(BitcoinTransactionLoader.name);

  constructor(
    private bitcoinApiService: BitcoinApiService,
    @InjectSentry() private sentryService: SentryService,
  ) {}

  public getBatchFunction() {
    return async (txids: string[]) => {
      this.logger.debug(`Loading bitcoin transactions: ${txids.join(', ')}`);
      const results = await Promise.allSettled(
        txids.map(async (txid) => this.bitcoinApiService.getTxOutSpends({ txid: txid })),
      );
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        this.logger.error(`Requesting: ${txids[index]}, occurred error: ${result.reason}`);
        this.sentryService.instance().captureException(result.reason);
        return null;
      });
    };
  }
}
export type BitcoinTransactionOutSpendsLoaderType = DataLoader<
  string,
  BitcoinApi.OutSpend[] | null
>;
export type BitcoinTransactionOutSpendsLoaderResponse =
  DataLoaderResponse<BitcoinTransactionOutSpendsLoader>;
