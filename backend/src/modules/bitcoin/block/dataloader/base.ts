import { Logger } from '@nestjs/common';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import * as BitcoinApi from 'src/core/bitcoin-api/bitcoin-api.schema';
import { Cache } from '@nestjs/cache-manager';

export abstract class BitcoinBaseLoader {
  protected logger = new Logger(BitcoinBaseLoader.name);
  abstract bitcoinApiService: BitcoinApiService;
  abstract cacheManager: Cache;

  protected async getBlock(hashOrHeight: string): Promise<BitcoinApi.Block> {
    if (hashOrHeight.startsWith('0')) {
      const block = await this.bitcoinApiService.getBlock({ hash: hashOrHeight });
      return block;
    }
    const height = parseInt(hashOrHeight, 10);
    const hash = await this.bitcoinApiService.getBlockHeight({ height });
    const block = await this.bitcoinApiService.getBlock({ hash });
    return block;
  }

  protected async getBlockTxs(
    hashOrHeight: string,
    startIndex: number = 0,
  ): Promise<BitcoinApi.Transaction[]> {
    if (hashOrHeight.startsWith('0')) {
      return this.bitcoinApiService.getBlockTxs({ hash: hashOrHeight, startIndex });
    }
    const height = parseInt(hashOrHeight, 10);
    const hash = await this.bitcoinApiService.getBlockHeight({ height });
    const txs = await this.bitcoinApiService.getBlockTxs({ hash, startIndex });
    return txs;
  }

  protected async getBlockTxids(hashOrHeight: string): Promise<string[]> {
    if (hashOrHeight.startsWith('0')) {
      const txs = await this.bitcoinApiService.getBlockTxids({ hash: hashOrHeight });
      return txs;
    }
    const height = parseInt(hashOrHeight, 10);
    const hash = await this.bitcoinApiService.getBlockHeight({ height });
    const txids = await this.bitcoinApiService.getBlockTxids({ hash });
    return txids;
  }
}
