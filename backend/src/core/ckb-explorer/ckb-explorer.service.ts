import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { Axios } from 'axios';
import { Env } from 'src/env';
import {
  Block,
  BlockList,
  NonPaginatedResponse,
  PaginatedResponse,
  Transaction,
} from './ckb-explorer.interface';

export enum BlockSortType {
  HeightAsc = 'height.asc',
  HeightDesc = 'height.desc',
  TransactionsAsc = 'transactions.asc',
  TransactionsDesc = 'transactions.desc',
  RewardAsc = 'reward.asc',
  RewardDesc = 'reward.desc',
}

@Injectable()
export class CKBExplorerService {
  private logger = new Logger(CKBExplorerService.name);
  private request: Axios;

  constructor(private configService: ConfigService<Env>) {
    this.request = axios.create({
      baseURL: this.configService.get('CKB_EXPLORER_API_ENDPOINT'),
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json',
      },
    });
  }

  public async getBlockList(
    page = 1,
    pageSize = 10,
    sort: BlockSortType = BlockSortType.HeightDesc,
  ): Promise<PaginatedResponse<BlockList>> {
    this.logger.debug(`/v1/blocks - page: ${page}, pageSize: ${pageSize}, sort: ${sort}`);
    const blockList = await this.request.get(
      `/v1/blocks?page=${page}&page_size=${pageSize}&sort=${sort}`,
    );
    return blockList.data;
  }

  public async getBlock(heightOrHash: string): Promise<NonPaginatedResponse<Block>> {
    this.logger.debug(`/v1/blocks/${heightOrHash}`);
    const block = await this.request.get(`/v1/blocks/${heightOrHash}`);
    return block.data;
  }

  public async getBlockTransactions(
    blockHash: string,
    page = 1,
    pageSize = 10,
  ): Promise<PaginatedResponse<Transaction>> {
    this.logger.debug(`/v1/block_transactions/${blockHash}`);
    const blockTransactions = await this.request.get(
      `/v1/block_transactions/${blockHash}?page=${page}&page_size=${pageSize}`,
    );
    return blockTransactions.data;
  }
}
