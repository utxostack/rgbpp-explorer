import DataLoader from 'dataloader';
import { Injectable, Logger } from '@nestjs/common';
import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import { DataLoaderResponse } from 'src/common/type/dataloader';
import { Address } from 'src/core/bitcoin-api/bitcoin-api.schema';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import { BitcoinBaseTransaction, BitcoinTransaction } from '../transaction/transaction.model';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';

@Injectable()
export class BitcoinAddressLoader implements NestDataLoader<string, Address | null> {
  private logger = new Logger(BitcoinAddressLoader.name);

  constructor(
    private bitcoinApiService: BitcoinApiService,
    @InjectSentry() private sentryService: SentryService,
  ) {}

  public getBatchFunction() {
    return async (addresses: string[]) => {
      this.logger.debug(`Loading bitcoin addresses stats: ${addresses.join(', ')}`);
      const results = await Promise.allSettled(
        addresses.map((address) => this.bitcoinApiService.getAddress({ address })),
      );
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        if (result.reason instanceof Error) {
          this.logger.error(`Requesting: ${addresses[index]}, occurred error: ${result.reason}`);
          this.sentryService.instance().captureException(result.reason);
        }
      });
    };
  }
}
export type BitcoinAddressLoaderType = DataLoader<string, Address | void>;
export type BitcoinAddressLoaderResponse = DataLoaderResponse<BitcoinAddressLoader>;

export interface BitcoinAddressTransactionsLoaderParams {
  address: string;
  afterTxid?: string;
}

@Injectable()
export class BitcoinAddressTransactionsLoader
  implements
    NestDataLoader<BitcoinAddressTransactionsLoaderParams, BitcoinBaseTransaction[] | void>
{
  private logger = new Logger(BitcoinAddressTransactionsLoader.name);

  constructor(
    private bitcoinApiService: BitcoinApiService,
    @InjectSentry() private sentryService: SentryService,
  ) {}

  public getBatchFunction() {
    return async (batchProps: BitcoinAddressTransactionsLoaderParams[]) => {
      this.logger.debug(`Loading bitcoin addresses txs: ${batchProps}`);
      const results = await Promise.allSettled(
        batchProps.map(async (props) => {
          const txs = await this.bitcoinApiService.getAddressTxs({
            address: props.address,
            afterTxid: props.afterTxid,
          });
          return txs.map((tx) => BitcoinTransaction.from(tx));
        }),
      );
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        if (result.reason instanceof Error) {
          this.logger.error(`Requesting: ${batchProps[index]}, occurred error: ${result.reason}`);
          this.sentryService.instance().captureException(result.reason);
        }
      });
    };
  }
}
export type BitcoinAddressTransactionsLoaderType = DataLoader<
  BitcoinAddressTransactionsLoaderParams,
  BitcoinBaseTransaction[] | void
>;
export type BitcoinAddressTransactionsLoaderResponse =
  DataLoaderResponse<BitcoinAddressTransactionsLoader>;
