import DataLoader from 'dataloader';
import { Injectable, Logger } from '@nestjs/common';
import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import { DataLoaderResponse } from 'src/common/type/dataloader';
import { Address } from 'src/core/bitcoin-api/bitcoin-api.schema';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import { BitcoinBaseTransaction, BitcoinTransaction } from '../transaction/transaction.model';

@Injectable()
export class BitcoinAddressLoader implements NestDataLoader<string, Address> {
  private logger = new Logger(BitcoinAddressLoader.name);

  constructor(private bitcoinApiService: BitcoinApiService) {}

  public getBatchFunction() {
    return (addresses: string[]) => {
      this.logger.debug(`Loading bitcoin addresses stats: ${addresses.join(', ')}`);
      return Promise.all(
        addresses.map((address) => this.bitcoinApiService.getAddress({ address })),
      );
    };
  }
}
export type BitcoinAddressLoaderType = DataLoader<string, Address>;
export type BitcoinAddressLoaderResponse = DataLoaderResponse<BitcoinAddressLoader>;

export interface BitcoinAddressTransactionsLoaderParams {
  address: string;
  afterTxid?: string;
}

@Injectable()
export class BitcoinAddressTransactionsLoader
  implements NestDataLoader<BitcoinAddressTransactionsLoaderParams, BitcoinBaseTransaction[]>
{
  private logger = new Logger(BitcoinAddressTransactionsLoader.name);

  constructor(private bitcoinApiService: BitcoinApiService) {}

  public getBatchFunction() {
    return (batchProps: BitcoinAddressTransactionsLoaderParams[]) => {
      this.logger.debug(`Loading bitcoin addresses txs: ${batchProps}`);
      return Promise.all(
        batchProps.map(async (props) => {
          const txs = await this.bitcoinApiService.getAddressTxs({
            address: props.address,
            afterTxid: props.afterTxid,
          });
          return txs.map((tx) => BitcoinTransaction.from(tx));
        }),
      );
    };
  }
}
export type BitcoinAddressTransactionsLoaderType = DataLoader<
  BitcoinAddressTransactionsLoaderParams,
  BitcoinBaseTransaction[]
>;
export type BitcoinAddressTransactionsLoaderResponse =
  DataLoaderResponse<BitcoinAddressTransactionsLoader>;
