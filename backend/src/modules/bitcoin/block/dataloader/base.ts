import { Logger } from '@nestjs/common';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import * as BitcoinApi from 'src/core/bitcoin-api/bitcoin-api.schema';
import { Cache } from '@nestjs/cache-manager';

export abstract class BitcoinBaseLoader {
  protected logger = new Logger(BitcoinBaseLoader.name);
  abstract bitcoinApiService: BitcoinApiService;
  abstract cacheManager: Cache;

  // private async getBlockHashByHeight(height: number): Promise<string> {
  //   const cacheKey = `bitcoinApiService#getBlockHeight:${height}`;
  //   const cached = await this.cacheManager.get<string>(cacheKey);
  //   if (cached) {
  //     return cached;
  //   }
  //   const hash = await this.bitcoinApiService.getBlockHeight({ height });
  //   await this.cacheManager.set(cacheKey, hash);
  //   return hash;
  // }

  // private async getBlockByHash(hash: string): Promise<BitcoinApi.Block> {
  //   const cacheKey = `bitcoinApiService#getBlock:${hash}`;
  //   const cached = await this.cacheManager.get<BitcoinApi.Block>(cacheKey);
  //   if (cached) {
  //     return cached;
  //   }
  //   const block = await this.bitcoinApiService.getBlock({ hash });
  //   const ttl = Date.now() - block.timestamp * 1000;
  //   await this.cacheManager.set(cacheKey, block, ttl);
  //   return block;
  // }

  // private async getBlockTxsByHash(
  //   hash: string,
  //   startIndex: number,
  // ): Promise<BitcoinApi.Transaction[]> {
  //   const cacheKey = `bitcoinApiService#getBlockTxs:${hash}:${startIndex}`;
  //   const cached = await this.cacheManager.get<BitcoinApi.Transaction[]>(cacheKey);
  //   if (cached) {
  //     return cached;
  //   }
  //   const txs = await this.bitcoinApiService.getBlockTxs({ hash, startIndex });
  //   await this.cacheManager.set(cacheKey, txs);
  //   return txs;
  // }

  // private async getBlockTxidsByHash(hash: string): Promise<string[]> {
  //   const cacheKey = `bitcoinApiService#getBlockTxids:${hash}`;
  //   const cached = await this.cacheManager.get<string[]>(cacheKey);
  //   if (cached) {
  //     return cached;
  //   }
  //   const txids = await this.bitcoinApiService.getBlockTxids({ hash });
  //   await this.cacheManager.set(cacheKey, txids);
  //   return txids;
  // }

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
    startIndex: number,
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
