import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { Axios } from 'axios';
import { Env } from 'src/env';
import {
  AddressInfo,
  AddressTransactionSortType,
  Block,
  CkbExplorerResponse,
  DetailTransaction,
  NonPaginatedResponse,
  PaginatedResponse,
  RgbppTransaction,
  Transaction,
  TransactionSortType,
  XUDT,
  XUDTTag,
  Statistics,
  TransactionFeesStatistic,
  TransactionListSortType,
} from './ckb-explorer.interface';
import { ONE_DAY_MS } from 'src/common/date';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Cacheable } from 'src/decorators/cacheable.decorator';
import { CkbRpcWebsocketService } from '../ckb-rpc/ckb-rpc-websocket.service';
import { BI } from '@ckb-lumos/bi';
import { CKB_MIN_SAFE_CONFIRMATIONS } from 'src/constants';

type BasePaginationParams = {
  page?: number;
  pageSize?: number;
};

export type GetAddressParams = BasePaginationParams & {
  address: string;
};

export type GetAddressTransactionsParams = BasePaginationParams & {
  address: string;
  sort?: AddressTransactionSortType;
};

type GetRgbppTransactionsParams = BasePaginationParams & {
  sort?: TransactionSortType;
  leapDirection?: 'in' | 'out';
};

type GetXUDTListParams = BasePaginationParams & {
  symbol?: string;
  sort?: TransactionListSortType;
  tags?: XUDTTag[];
};

type GetXUDTTransactionsParams = BasePaginationParams & {
  txHash?: string;
  addressHash?: string;
};

@Injectable()
export class CkbExplorerService {
  private logger = new Logger(CkbExplorerService.name);
  private request: Axios;

  constructor(
    private configService: ConfigService<Env>,
    private ckbRpcService: CkbRpcWebsocketService,
    @Inject(CACHE_MANAGER) protected cacheManager: Cache,
  ) {
    this.request = axios.create({
      baseURL: this.configService.get('CKB_EXPLORER_API_URL'),
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json',
      },
    });
    this.request.interceptors.request.use((request) => {
      this.logger.debug(`${request.method?.toUpperCase()} ${request.url}`);
      return request;
    });
  }

  private async isSafeConfirmations(blockNumber: string): Promise<boolean> {
    try {
      const tipBlockNumber = await this.ckbRpcService.getTipBlockNumber();
      return BI.from(blockNumber).lt(BI.from(tipBlockNumber).sub(CKB_MIN_SAFE_CONFIRMATIONS));
    } catch {
      return false;
    }
  }

  @Cacheable({
    namespace: 'CkbExplorerService',
    key: (address: string, page = 1, pageSize = 10) => `getAddress:${address},${page},${pageSize}`,
    ttl: 10_000,
  })
  public async getAddress({
    address,
    page = 1,
    pageSize = 10,
  }: GetAddressParams): Promise<PaginatedResponse<AddressInfo>> {
    const response = await this.request.get(`/v1/addresses/${address}`, {
      params: {
        page,
        pageSize,
      },
    });
    return response.data;
  }

  @Cacheable({
    namespace: 'CkbExplorerService',
    key: (address: string, sort, page = 1, pageSize = 10) =>
      `getAddressTransactions:${address},${sort},${page},${pageSize}`,
    ttl: 10_000,
  })
  public async getAddressTransactions({
    address,
    sort,
    page = 1,
    pageSize = 10,
  }: GetAddressTransactionsParams): Promise<PaginatedResponse<Transaction>> {
    const response = await this.request.get(`/v1/address_transactions/${address}`, {
      params: {
        sort,
        page,
        pageSize,
      },
    });
    return response.data;
  }

  @Cacheable({
    namespace: 'CkbExplorerService',
    key: (heightOrHash: string) => `getBlock:${heightOrHash}`,
    ttl: ONE_DAY_MS,
    shouldCache: async (block: NonPaginatedResponse<Block>, that: CkbExplorerService) => {
      const { number } = block.data.attributes;
      return that.isSafeConfirmations(number);
    },
  })
  public async getBlock(heightOrHash: string): Promise<NonPaginatedResponse<Block>> {
    const response = await this.request.get(`/v1/blocks/${heightOrHash}`);
    return response.data;
  }

  @Cacheable({
    namespace: 'CkbExplorerService',
    key: (address: string, leapDirection, page = 1, pageSize = 10) =>
      `getRgbppTransactions:${address},${page},${pageSize},${leapDirection}`,
    ttl: 10_000,
  })
  public async getRgbppTransactions({
    sort = TransactionSortType.NumberDesc,
    page = 1,
    pageSize = 10,
    leapDirection,
  }: GetRgbppTransactionsParams = {}): Promise<
    CkbExplorerResponse<
      {
        ckb_transactions: RgbppTransaction[];
      },
      true
    >
  > {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    params.append('sort', sort);
    if (leapDirection) {
      params.append('leap_direction', leapDirection);
    }
    const response = await this.request.get(`/v2/rgb_transactions?${params.toString()}`);
    return response.data;
  }

  public async getAddressRgbppCells({
    address,
    sort,
    page = 1,
    pageSize = 10,
  }: GetAddressTransactionsParams): Promise<PaginatedResponse<AddressInfo>> {
    const response = await this.request.get(`/v2/bitcoin_addresses/${address}/rgb_cells`, {
      params: {
        sort,
        page,
        pageSize,
      },
    });
    return response.data;
  }

  @Cacheable({
    namespace: 'CkbExplorerService',
    key: (txHash: string) => `getTransaction:${txHash}`,
    ttl: ONE_DAY_MS,
    shouldCache: async (tx: NonPaginatedResponse<DetailTransaction>, that: CkbExplorerService) => {
      const { tx_status, block_number } = tx.data.attributes;
      const isSafeConfirmations = await that.isSafeConfirmations(block_number);
      return tx_status === 'committed' && isSafeConfirmations;
    },
  })
  public async getTransaction(txHash: string): Promise<NonPaginatedResponse<DetailTransaction>> {
    const response = await this.request.get(`/v1/transactions/${txHash}`);
    return response.data;
  }

  @Cacheable({
    namespace: 'CkbExplorerService',
    key: (address: string, tags = [], sort, page = 1, pageSize = 10) =>
      `getXUDTList:${address},${tags.join('|')},${sort},${page},${pageSize}`,
    ttl: 10_000,
  })
  public async getXUDTList({
    symbol,
    tags,
    sort,
    page = 1,
    pageSize = 10,
  }: GetXUDTListParams): Promise<PaginatedResponse<XUDT>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    if (symbol) {
      params.append('symbol', symbol);
    }
    if (tags) {
      params.append('tags', tags.join(','));
    }
    if (sort) {
      params.append('sort', sort);
    }
    const response = await this.request.get(`/v1/xudts?${params.toString()}`);
    return response.data;
  }

  public async getXUDT(typeHash: string): Promise<NonPaginatedResponse<XUDT>> {
    const response = await this.request.get(`/v1/xudts/${typeHash}`);
    return response.data;
  }

  @Cacheable({
    namespace: 'CkbExplorerService',
    key: (typeHash: string, { page = 1, pageSize = 10, txHash, addressHash }) =>
      `getXUDTTransactions:${typeHash},${page},${pageSize},${txHash},${addressHash}`,
    ttl: 10_000,
  })
  public async getXUDTTransactions(
    typeHash: string,
    { page = 1, pageSize = 10, txHash, addressHash }: GetXUDTTransactionsParams = {},
  ): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    if (txHash) {
      params.append('tx_hash', txHash);
    }
    if (addressHash) {
      params.append('address_hash', addressHash);
    }
    const response = await this.request.get(
      `/v1/udt_transactions/${typeHash}?${params.toString()}`,
    );
    return response.data;
  }

  @Cacheable({
    namespace: 'CkbExplorerService',
    key: 'getStatistics',
    // Same as the ckb explorer frontend
    // https://github.com/nervosnetwork/ckb-explorer-frontend/blob/develop/src/constants/common.ts#L3
    ttl: 4_000,
  })
  public async getStatistics(): Promise<NonPaginatedResponse<Statistics>> {
    const response = await this.request.get('/v1/statistics');
    return response.data;
  }

  public async getTransactionFeesStatistic(): Promise<TransactionFeesStatistic> {
    const response = await this.request.get('/v2/statistics/transaction_fees');
    return response.data;
  }
}
