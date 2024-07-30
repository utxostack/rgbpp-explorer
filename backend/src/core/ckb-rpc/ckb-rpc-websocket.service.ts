import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { Client as RpcWebsocketsClient } from 'rpc-websockets';
import { BI } from '@ckb-lumos/bi';
import { Env } from 'src/env';
import {
  Block,
  BlockEconomicState,
  GetCellsResult,
  GetTransactionsResult,
  SearchKey,
  TransactionWithStatusResponse,
} from './ckb-rpc.interface';

@Injectable()
export class CkbRpcWebsocketService {
  private logger = new Logger(CkbRpcWebsocketService.name);
  private websocket: RpcWebsocketsClient;

  constructor(private configService: ConfigService<Env>) {
    this.websocket = new RpcWebsocketsClient(this.configService.get('CKB_RPC_WEBSOCKET_URL'));
    this.websocket.on('error', (error) => {
      this.logger.error(error.message);
    });
  }

  public async getTransaction(txHash: string): Promise<TransactionWithStatusResponse> {
    this.logger.debug(`get_transaction - txHash: ${txHash}`);
    const tx = await this.websocket.call('get_transaction', [txHash]);
    return tx as TransactionWithStatusResponse;
  }

  public async getBlock(blockHash: string): Promise<Block> {
    this.logger.debug(`get_block - blockHash: ${blockHash}`);
    const block = await this.websocket.call('get_block', [blockHash]);
    return block as Block;
  }

  public async getBlockByNumber(blockNumber: string): Promise<Block> {
    this.logger.debug(`get_block_by_number - blockNumber: ${blockNumber}`);
    const block = await this.websocket.call('get_block_by_number', [
      BI.from(blockNumber).toHexString(),
    ]);
    return block as Block;
  }

  public async getBlockEconomicState(blockHash: string): Promise<BlockEconomicState> {
    this.logger.debug(`get_block_economic_state - blockHash: ${blockHash}`);
    const blockEconomicState = await this.websocket.call('get_block_economic_state', [blockHash]);
    return blockEconomicState as BlockEconomicState;
  }

  public async getTipBlockNumber(): Promise<number> {
    this.logger.debug('get_tip_block_number');
    const tipBlockNumber = await this.websocket.call('get_tip_block_number', []);
    return BI.from(tipBlockNumber).toNumber();
  }

  public async getTransactions(
    searchKey: SearchKey,
    order: 'asc' | 'desc',
    limit: string,
  ): Promise<GetTransactionsResult> {
    this.logger.debug(
      `get_transactions - searchKey: ${JSON.stringify(searchKey)}, order: ${order}, limit: ${limit}`,
    );
    const transactions = await this.websocket.call('get_transactions', [searchKey, order, limit]);
    return transactions as GetTransactionsResult;
  }

  public async getCells(
    searchKey: SearchKey,
    order: 'asc' | 'desc',
    limit: string,
    after?: string,
  ): Promise<GetCellsResult> {
    this.logger.debug(
      `get_cells - searchKey: ${JSON.stringify(searchKey)}, order: ${order}, limit: ${limit}, after: ${after}`,
    );
    const cells = await this.websocket.call('get_cells', [searchKey, order, limit, after]);
    return cells as GetCellsResult;
  }
}
