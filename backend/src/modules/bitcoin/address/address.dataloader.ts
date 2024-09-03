import DataLoader from 'dataloader';
import { Injectable, Logger } from '@nestjs/common';
import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import { DataLoaderResponse } from 'src/common/type/dataloader';
import { Address } from 'src/core/bitcoin-api/bitcoin-api.schema';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import { BitcoinTransaction } from '../transaction/transaction.model';
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
        this.logger.error(`Requesting: ${addresses[index]}, occurred error: ${result.reason}`);
        this.sentryService.instance().captureException(result.reason);
        return null;
      });
    };
  }
}
export type BitcoinAddressLoaderType = DataLoader<string, Address | null>;
export type BitcoinAddressLoaderResponse = DataLoaderResponse<BitcoinAddressLoader>;

@Injectable()
export class BitcoinAddressTransactionsLoader
  implements NestDataLoader<string, BitcoinTransaction[] | null>
{
  private logger = new Logger(BitcoinAddressTransactionsLoader.name);

  constructor(
    private bitcoinApiService: BitcoinApiService,
    @InjectSentry() private sentryService: SentryService,
  ) {}

  public getBatchFunction() {
    return async (props: string[]) => {
      this.logger.debug(`Loading bitcoin addresses txs: ${props}`);
      const results = await Promise.allSettled(
        props.map(async (key) => {
          const [address, afterTxid] = key.split(',');
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
        this.logger.error(`Requesting: ${props[index]}, occurred error: ${result.reason}`);
        this.sentryService.instance().captureException(result.reason);
        return null;
      });
    };
  }
}
export type BitcoinAddressTransactionsLoaderType = DataLoader<string, BitcoinTransaction[] | null>;
export type BitcoinAddressTransactionsLoaderResponse =
  DataLoaderResponse<BitcoinAddressTransactionsLoader>;
