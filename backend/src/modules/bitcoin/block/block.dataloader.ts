import { Injectable, Logger } from '@nestjs/common';
import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import { DataLoaderResponse } from 'src/common/type/dataloader';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import * as BitcoinApi from 'src/core/bitcoin-api/bitcoin-api.schema';

@Injectable()
export class BitcoinBlockLoader implements NestDataLoader<string, BitcoinApi.Block> {
  private logger = new Logger(BitcoinBlockLoader.name);

  constructor(private bitcoinApiService: BitcoinApiService) {}

  public getBatchFunction() {
    return (keys: string[]) => {
      this.logger.debug(`Loading bitcoin blocks: ${keys.join(', ')}`);
      return Promise.all(
        keys.map(async (key) => {
          let hash = key;
          if (!hash.startsWith('0')) {
            hash = await this.bitcoinApiService.getBlockHeight({ height: parseInt(key, 10) });
          }
          const block = await this.bitcoinApiService.getBlock({ hash });
          return block;
        }),
      );
    };
  }
}
export type BitcoinBlockLoaderResponse = DataLoaderResponse<BitcoinBlockLoader>;

export interface BitcoinBlockTransactionsLoaderProps {
  hash: string;
  startIndex?: number;
}

@Injectable()
export class BitcoinBlockTransactionsLoader
  implements NestDataLoader<BitcoinBlockTransactionsLoaderProps, BitcoinApi.Transaction[]>
{
  private logger = new Logger(BitcoinBlockLoader.name);

  constructor(private bitcoinApiService: BitcoinApiService) {}

  public getBatchFunction() {
    return (batchProps: BitcoinBlockTransactionsLoaderProps[]) => {
      this.logger.debug(`Loading bitcoin block transactions: ${batchProps}`);
      return Promise.all(
        batchProps.map((props) =>
          this.bitcoinApiService.getBlockTxs({
            hash: props.hash,
            startIndex: props.startIndex,
          }),
        ),
      );
    };
  }
}
export type BitcoinBlockTransactionsLoaderResponse =
  DataLoaderResponse<BitcoinBlockTransactionsLoader>;
