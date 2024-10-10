import { HttpStatusCode, isAxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { NetworkType } from 'src/constants';
import { Env } from 'src/env';
import { IBitcoinDataProvider } from './bitcoin-api.interface';
import { ElectrsService } from './provider/electrs.service';
import { MempoolService } from './provider/mempool.service';
import { ChainInfo, Transaction } from './bitcoin-api.schema';
import { ONE_HOUR_MS, ONE_DAY_MS, TEN_MINUTES_MS } from 'src/common/date';
import { Cacheable } from 'src/decorators/cacheable.decorator';
import * as Sentry from '@sentry/nestjs';
import { PLimit } from 'src/decorators/plimit.decorator';

type MethodParameters<T, K extends keyof T> = T[K] extends (...args: infer P) => any ? P : never;
type MethodReturnType<T, K extends keyof T> = T[K] extends (...args: any[]) => infer R ? R : never;

// https://github.com/mempool/electrs/blob/d4f788fc3d7a2b4eca4c5629270e46baba7d0f19/src/errors.rs#L6
export enum BitcoinClientErrorMessage {
  Connection = 'Connection error',
  Interrupt = 'Interruption by external signal',
  TooManyUtxos = 'Too many unspent transaction outputs',
  TooManyTxs = 'Too many history transactions',
  ElectrumClient = 'Electrum client error',
}

export enum BitcoinClientErrorCode {
  Connection = 0x1000, // 4096
  Interrupt = 0x1001, // 4097
  TooManyUtxos = 0x1002, // 4098
  TooManyTxs = 0x1003, // 4099
  ElectrumClient = 0x1004, // 4100
}

const BitcoinClientErrorMap = {
  [BitcoinClientErrorMessage.Connection]: BitcoinClientErrorCode.Connection,
  [BitcoinClientErrorMessage.Interrupt]: BitcoinClientErrorCode.Interrupt,
  [BitcoinClientErrorMessage.TooManyUtxos]: BitcoinClientErrorCode.TooManyUtxos,
  [BitcoinClientErrorMessage.TooManyTxs]: BitcoinClientErrorCode.TooManyTxs,
  [BitcoinClientErrorMessage.ElectrumClient]: BitcoinClientErrorCode.ElectrumClient,
};

export class BitcoinServiceError extends Error {
  public statusCode = HttpStatusCode.ServiceUnavailable;
  public errorCode: BitcoinClientErrorCode;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;

    const errorKey = Object.keys(BitcoinClientErrorMap).find((msg) => message.startsWith(msg));
    this.errorCode = BitcoinClientErrorMap[errorKey as BitcoinClientErrorMessage];
  }
}

@Injectable()
export class BitcoinApiService {
  private logger = new Logger(BitcoinApiService.name);

  private source: IBitcoinDataProvider;
  private fallback?: IBitcoinDataProvider;

  constructor(private configService: ConfigService<Env>) {
    const BITCOIN_DATA_PROVIDER = this.configService.get('BITCOIN_PRIMARY_DATA_PROVIDER');
    const BITCOIN_ELECTRS_API_URL = this.configService.get('BITCOIN_ELECTRS_API_URL');
    const BITCOIN_MEMPOOL_SPACE_API_URL = this.configService.get('BITCOIN_MEMPOOL_SPACE_API_URL');
    const network = this.configService.get('NETWORK');

    switch (BITCOIN_DATA_PROVIDER) {
      case 'mempool':
        this.logger.log('Using Mempool.space API as the bitcoin data provider');
        this.source = new MempoolService(BITCOIN_MEMPOOL_SPACE_API_URL, network);
        if (BITCOIN_ELECTRS_API_URL) {
          this.logger.log('Using Electrs API as the fallback bitcoin data provider');
          this.fallback = new ElectrsService(BITCOIN_ELECTRS_API_URL);
        }
        break;
      case 'electrs':
        this.logger.log('Using Electrs API as the bitcoin data provider');
        this.source = new ElectrsService(BITCOIN_ELECTRS_API_URL);
        if (BITCOIN_MEMPOOL_SPACE_API_URL) {
          this.logger.log('Using Mempool.space API as the fallback bitcoin data provider');
          this.fallback = new MempoolService(BITCOIN_MEMPOOL_SPACE_API_URL, network);
        }
        break;
      default:
        throw new Error('Invalid bitcoin data provider');
    }
  }

  @PLimit({ concurrency: 200 })
  private async call<K extends keyof IBitcoinDataProvider>(
    method: K,
    ...args: MethodParameters<IBitcoinDataProvider, K>
  ): Promise<MethodReturnType<IBitcoinDataProvider, K>> {
    try {
      this.logger.debug(`Calling ${method} with args: ${JSON.stringify(args)}`);
      // eslint-disable-next-line @typescript-eslint/ban-types
      const result = await (this.source[method] as Function).apply(this.source, args);
      return result as MethodReturnType<IBitcoinDataProvider, K>;
    } catch (err) {
      let calledError = err;
      this.logger.error(err);
      Sentry.captureException(err);
      if (this.fallback) {
        this.logger.warn(
          `Fallback to ${this.fallback.constructor.name} due to error: ${(err as Error).message}`,
        );
        try {
          // eslint-disable-next-line @typescript-eslint/ban-types
          const result = await (this.fallback[method] as Function).apply(this.fallback, args);
          return result as MethodReturnType<IBitcoinDataProvider, K>;
        } catch (fallbackError) {
          this.logger.error(fallbackError);
          Sentry.captureException(fallbackError);
          calledError = fallbackError;
        }
      }
      if (isAxiosError(calledError)) {
        const error = new BitcoinServiceError(calledError.response?.data ?? calledError.message);
        if (calledError.response?.status) {
          error.statusCode = calledError.response.status;
        }
        throw new HttpException(error, error.statusCode);
      }
      throw new HttpException(calledError, HttpStatusCode.ServiceUnavailable);
    }
  }

  public async checkNetwork(network: NetworkType) {
    const hash = await this.getBlockHeight({ height: 0 });
    switch (network) {
      case NetworkType.mainnet:
        // Bitcoin mainnet genesis block hash
        if (hash !== '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f') {
          throw new Error('Bitcoin client is not running on mainnet');
        }
        break;
      case NetworkType.testnet:
        // Bitcoin testnet genesis block hash
        if (hash !== '000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943') {
          throw new Error('Bitcoin client is not running on testnet');
        }
        break;
      case NetworkType.signet:
        // Bitcoin signet genesis block hash
        if (hash !== '00000008819873e925422c1ff0f99f7cc9bbb232af63a077a480a3633bee1ef6') {
          throw new Error('Bitcoin client is not running on signet');
        }
        break;
      default:
    }
  }

  public async getBlockchainInfo(): Promise<ChainInfo> {
    const hash = await this.getBlocksTipHash();
    const tip = await this.getBlock({ hash });

    const { difficulty, mediantime } = tip;
    const network = this.configService.get('NETWORK');
    return {
      chain: network === 'mainnet' ? 'main' : 'test',
      blocks: tip.height,
      bestblockhash: hash,
      difficulty,
      mediantime,
    };
  }

  @Cacheable({
    namespace: 'bitcoinApiService',
    key: 'getFeesRecommended',
    ttl: 10_000,
  })
  public async getFeesRecommended() {
    return this.call('getFeesRecommended');
  }

  @Cacheable({
    namespace: 'bitcoinApiService',
    key: ({ address }) => `getAddress:${address}`,
    ttl: 10_000,
  })
  public async getAddress({ address }: { address: string }) {
    return this.call('getAddress', { address });
  }

  @Cacheable({
    namespace: 'bitcoinApiService',
    key: ({ address }) => `getAddressTxsUtxo:${address}`,
    ttl: 10_000,
  })
  public async getAddressTxsUtxo({ address }: { address: string }) {
    return this.call('getAddressTxsUtxo', { address });
  }

  @Cacheable({
    namespace: 'bitcoinApiService',
    key: ({ address, afterTxid }) => `getAddressTxs:${address}:${afterTxid}`,
    ttl: 10_000,
  })
  public async getAddressTxs({ address, afterTxid }: { address: string; afterTxid?: string }) {
    return this.call('getAddressTxs', { address, afterTxid });
  }

  @Cacheable({
    namespace: 'bitcoinApiService',
    key: ({ txid }) => `getTx:${txid}`,
    ttl: ONE_DAY_MS,
    shouldCache: (tx: Transaction) =>
      tx.status.confirmed &&
      !!tx.status.block_time &&
      Date.now() - tx.status.block_time > ONE_HOUR_MS,
  })
  public async getTx({ txid }: { txid: string }) {
    return this.call('getTx', { txid });
  }

  public async getTxOutSpend({ txid, vout }: { txid: string; vout: number }) {
    return this.call('getTxOutSpend', { txid, vout });
  }

  @Cacheable({
    namespace: 'bitcoinApiService',
    key: ({ txid }) => `getTxOutSpends:${txid}`,
    ttl: ONE_DAY_MS,
  })
  public async getTxOutSpends({ txid }: { txid: string }) {
    return this.call('getTxOutSpends', { txid });
  }

  @Cacheable({
    namespace: 'bitcoinApiService',
    key: ({ txids }) => `getTransactionTimes:${txids.join(',')}`,
    ttl: 10_000,
  })
  public async getTransactionTimes({ txids }: { txids: string[] }) {
    return this.call('getTransactionTimes', { txids });
  }

  @Cacheable({
    namespace: 'bitcoinApiService',
    key: ({ hash }) => `getBlock:${hash}`,
    ttl: ONE_DAY_MS,
  })
  public async getBlock({ hash }: { hash: string }) {
    return this.call('getBlock', { hash });
  }

  @Cacheable({
    namespace: 'bitcoinApiService',
    key: ({ hash, startIndex }) => `getBlockTxs:${hash}:${startIndex}`,
    ttl: ONE_DAY_MS,
  })
  public async getBlockTxs({ hash, startIndex }: { hash: string; startIndex?: number }) {
    return this.call('getBlockTxs', { hash, startIndex });
  }

  @Cacheable({
    namespace: 'bitcoinApiService',
    key: ({ height }) => `getBlockHeight:${height}`,
    ttl: TEN_MINUTES_MS,
  })
  public async getBlockHeight({ height }: { height: number }) {
    return this.call('getBlockHeight', { height });
  }

  @Cacheable({
    namespace: 'bitcoinApiService',
    key: ({ hash }) => `getBlockTxids:${hash}`,
    ttl: ONE_DAY_MS,
  })
  public async getBlockTxids({ hash }: { hash: string }) {
    return this.call('getBlockTxids', { hash });
  }

  public async getBlocksTipHash() {
    return this.call('getBlocksTipHash');
  }
}
