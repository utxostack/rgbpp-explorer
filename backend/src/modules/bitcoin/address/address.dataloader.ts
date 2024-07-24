import { Injectable, Logger } from '@nestjs/common';
import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import { Address } from 'src/core/bitcoin-api/bitcoin-api.schema';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import { DataLoaderResponse } from 'src/common/type/dataloader';
import { BitcoinTransaction } from '../transaction/transaction.model';

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
export type BitcoinAddressLoaderResponse = DataLoaderResponse<BitcoinAddressLoader>;

export interface BitcoinAddressBalance {
  satoshi: number;
  pendingSatoshi: number;
}

@Injectable()
export class BitcoinAddressBalanceLoader implements NestDataLoader<string, BitcoinAddressBalance> {
  private logger = new Logger(BitcoinAddressBalanceLoader.name);

  constructor(private bitcoinApiService: BitcoinApiService) {}

  public getBatchFunction() {
    return (addresses: string[]) => {
      this.logger.debug(`Loading bitcoin addresses balance: ${addresses.join(', ')}`);
      return Promise.all(
        addresses.map(async (address) => {
          // XXX: Miners has higher chance of getting this error: Too many unspent transaction outputs (>9000). Contact support to raise limits.
          const utxos = await this.bitcoinApiService.getAddressTxsUtxo({ address });

          let satoshi = 0;
          let pendingSatoshi = 0;
          utxos.forEach((utxo) => {
            satoshi += utxo.value;
            if (!utxo.status.confirmed) {
              pendingSatoshi += utxo.value;
            }
          });
          return {
            satoshi,
            pendingSatoshi,
          };
        }),
      );
    };
  }
}
export type BitcoinAddressBalanceLoaderResponse = DataLoaderResponse<BitcoinAddressBalanceLoader>;

export interface BitcoinAddressTransactionsLoaderProps {
  address: string;
  afterTxid?: string;
}

@Injectable()
export class BitcoinAddressTransactionsLoader
  implements NestDataLoader<BitcoinAddressTransactionsLoaderProps, BitcoinTransaction[]>
{
  private logger = new Logger(BitcoinAddressTransactionsLoader.name);

  constructor(private bitcoinApiService: BitcoinApiService) {}

  public getBatchFunction() {
    return (batchProps: BitcoinAddressTransactionsLoaderProps[]) => {
      this.logger.debug(`Loading bitcoin addresses txs: ${batchProps}`);
      return Promise.all(
        batchProps.map(async (props) => {
          const txs = await this.bitcoinApiService.getAddressTxs({
            address: props.address,
            after_txid: props.afterTxid,
          });
          return txs.map((tx) => BitcoinTransaction.from(tx));
        }),
      );
    };
  }
}
export type BitcoinAddressTransactionsLoaderResponse =
  DataLoaderResponse<BitcoinAddressTransactionsLoader>;
