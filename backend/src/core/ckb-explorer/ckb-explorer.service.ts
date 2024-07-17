import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { Axios } from 'axios';
import { Env } from 'src/env';
import {
  Block,
  BlockList,
  BlockSortType,
  CkbExplorerResponse,
  NonPaginatedResponse,
  PaginatedResponse,
  RgbppTransaction,
  Transaction,
  TransactionSortType,
} from './ckb-explorer.interface';

type BasePaginationParams = {
  page?: number;
  pageSize?: number;
};

type GetBlockListParams = BasePaginationParams & {
  sort?: BlockSortType;
};

type GetRgbppTransactionsParams = BasePaginationParams & {
  sort?: TransactionSortType;
  leapDirection?: 'in' | 'out';
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
}
