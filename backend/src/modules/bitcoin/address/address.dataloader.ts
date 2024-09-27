import DataLoader from 'dataloader';
import { Injectable, Logger } from '@nestjs/common';
import { DataLoaderResponse } from 'src/common/dataloader';
import { Address } from 'src/core/bitcoin-api/bitcoin-api.schema';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import { BitcoinTransaction } from '../transaction/transaction.model';
import * as Sentry from '@sentry/nestjs';
import { NestDataLoader } from 'src/common/dataloader';

@Injectable()
export class BitcoinAddressLoader implements NestDataLoader<string, Address | null> {
  private logger = new Logger(BitcoinAddressLoader.name);

  constructor(private bitcoinApiService: BitcoinApiService) {}

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
        this.logger.error(`Requesting: ${addresses[index]}, occurred error: ${result.reason}`);
        Sentry.captureException(result.reason);
        return null;
      });
    };
  }
}
export type BitcoinAddressLoaderType = DataLoader<string, Address | null>;
export type BitcoinAddressLoaderResponse = DataLoaderResponse<BitcoinAddressLoader>;

export interface GetAddressTxsParams {
  address: string;
  afterTxid?: string;
}

@Injectable()
export class BitcoinAddressTransactionsLoader
  implements NestDataLoader<GetAddressTxsParams, BitcoinTransaction[] | null>
{
  private logger = new Logger(BitcoinAddressTransactionsLoader.name);

  constructor(private bitcoinApiService: BitcoinApiService) {}

  public getOptions() {
    return {
      cacheKeyFn: (key: GetAddressTxsParams) => {
        const afterTxid = key.afterTxid ? `-${key.afterTxid}` : '';
        return `${key.address}${afterTxid}`;
      },
    };
  }

  public getBatchFunction() {
    return async (batchParams: GetAddressTxsParams[]) => {
      this.logger.debug(`Loading bitcoin addresses txs: ${JSON.stringify(batchParams)}`);
      const results = await Promise.allSettled(
        batchParams.map(async ({ address, afterTxid }) => {
          const txs = await this.bitcoinApiService.getAddressTxs({
            address,
            afterTxid,
          });
          return txs.map((tx) => BitcoinTransaction.from(tx));
        }),
      );
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        this.logger.error(
          `Requesting: ${JSON.stringify(batchParams[index])}, occurred error: ${result.reason}`,
        );
        Sentry.captureException(result.reason);
        return null;
      });
    };
  }
}
export type BitcoinAddressTransactionsLoaderType = DataLoader<
  GetAddressTxsParams,
  BitcoinTransaction[] | null
>;
export type BitcoinAddressTransactionsLoaderResponse =
  DataLoaderResponse<BitcoinAddressTransactionsLoader>;
