import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { Axios } from 'axios';
import { Env } from 'src/env';
import {
  AddressInfo,
  AddressTransactionSortType,
  Block,
  BlockList,
  BlockSortType,
  CkbExplorerResponse,
  DetailTransaction,
  NonPaginatedResponse,
  PaginatedResponse,
  RgbppDigest,
  RgbppTransaction,
  Transaction,
  TransactionSortType,
  XUDT,
  XUDTTag,
} from './ckb-explorer.interface';

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

type GetBlockListParams = BasePaginationParams & {
  sort?: BlockSortType;
};

type GetRgbppTransactionsParams = BasePaginationParams & {
  sort?: TransactionSortType;
  leapDirection?: 'in' | 'out';
};

type GetXUDTListParams = BasePaginationParams & {
  symbol?: string;
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

  constructor(private configService: ConfigService<Env>) {
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

  // https://github.com/nervosnetwork/ckb-explorer-frontend/blob/b9dd537f836e8c827f1d4741e07c84484170d671/src/pages/Address/AddressPage.tsx#L50-L54
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

  public async getBlockList({
    page = 1,
    pageSize = 10,
    sort = BlockSortType.HeightDesc,
  }: GetBlockListParams = {}): Promise<PaginatedResponse<BlockList>> {
    const response = await this.request.get(
      `/v1/blocks?page=${page}&page_size=${pageSize}&sort=${sort}`,
    );
    return response.data;
  }

  public async getBlock(heightOrHash: string): Promise<NonPaginatedResponse<Block>> {
    const response = await this.request.get(`/v1/blocks/${heightOrHash}`);
    return response.data;
  }

  public async getBlockTransactions(
    blockHash: string,
    { page = 1, pageSize = 10 }: BasePaginationParams = {},
  ): Promise<PaginatedResponse<Transaction>> {
    const response = await this.request.get(
      `/v1/block_transactions/${blockHash}?page=${page}&page_size=${pageSize}`,
    );
    return response.data;
  }

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

  public async getTransaction(txHash: string): Promise<NonPaginatedResponse<DetailTransaction>> {
    const response = await this.request.get(`/v1/transactions/${txHash}`);
    return response.data;
  }

  public async getRgbppDigest(txHash: string): Promise<CkbExplorerResponse<RgbppDigest>> {
    const response = await this.request.get(`/v2/ckb_transactions/${txHash}/rgb_digest`);
    return response.data;
  }

  public async getXUDTList({
    symbol,
    tags,
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
    const response = await this.request.get(`/v1/xudts?${params.toString()}`);
    return response.data;
  }

  public async getXUDT(typeHash: string): Promise<NonPaginatedResponse<XUDT>> {
    const response = await this.request.get(`/v1/xudts/${typeHash}`);
    return response.data;
  }

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
}
