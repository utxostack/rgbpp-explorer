import { Logger } from '@nestjs/common';
import { Client as RpcWebsocketsClient } from 'rpc-websockets';
import { BI } from '@ckb-lumos/bi';
import {
  Block,
  BlockEconomicState,
  GetCellsResult,
  GetTransactionsResult,
  SearchKey,
  TransactionWithStatusResponse,
} from './blockchain.interface';
import { SentryService } from '@ntegral/nestjs-sentry';

class WebsocketError extends Error { }

export class BlockchainService {
  private logger = new Logger(BlockchainService.name);

  private websocket: RpcWebsocketsClient;
  private websocketReady: Promise<void>;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;

  constructor(
    public chainId: number,
    private wsUrl: string,
    private sentryService: SentryService,
  ) {
    this.createConnection();
  }

  private createConnection() {
    this.websocket = new RpcWebsocketsClient(this.wsUrl);

    this.websocketReady = new Promise((resolve) => {
      this.websocket.on('open', () => {
        this.logger.log(`WebSocket connection established for chain ${this.chainId}`);
        this.reconnectAttempts = 0;
        resolve();
      });

      this.websocket.on('error', (error) => {
        this.logger.error(error.message);
        const webSocketError = new WebsocketError(error.message);
        webSocketError.stack = error.stack;
        this.websocketReady = Promise.reject(webSocketError);
        this.sentryService.instance().captureException(webSocketError);
      });

      this.websocket.on('close', () => {
        const error = new WebsocketError('WebSocket connection closed');
        this.logger.warn(error.message);
        this.websocketReady = Promise.reject(error);
        this.handleReconnection();
      });
    });
  }

  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.logger.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      );
      setTimeout(() => this.createConnection(), this.reconnectInterval);
    } else {
      const error = new WebsocketError('Max reconnection attempts reached');
      this.logger.error(error.message);
      this.sentryService.instance().captureException(error);
    }
  }

  public async close(): Promise<void> {
    if (this.websocket) {
      this.websocket.close();
    }
  }

  public async getTransaction(txHash: string): Promise<TransactionWithStatusResponse> {
    await this.websocketReady;
    this.logger.debug(`get_transaction - txHash: ${txHash}`);
    const tx = await this.websocket.call('get_transaction', [txHash]);
    return tx as TransactionWithStatusResponse;
  }

  public async getBlock(blockHash: string): Promise<Block> {
    await this.websocketReady;
    this.logger.debug(`get_block - blockHash: ${blockHash}`);
    let block = await this.websocket.call('get_block', [blockHash]);
    return block as Block;
  }

  public async getBlockByNumber(blockNumber: string): Promise<Block> {
    await this.websocketReady;
    this.logger.debug(`get_block_by_number - blockNumber: ${blockNumber}`);
    const block = await this.websocket.call('get_block_by_number', [
      BI.from(blockNumber).toHexString(),
    ]);
    return block as Block;
  }

  public async getBlockEconomicState(blockHash: string): Promise<BlockEconomicState> {
    await this.websocketReady;
    this.logger.debug(`get_block_economic_state - blockHash: ${blockHash}`);
    const blockEconomicState = await this.websocket.call('get_block_economic_state', [blockHash]);
    return blockEconomicState as BlockEconomicState;
  }

  public async getTipBlockNumber(): Promise<number> {
    await this.websocketReady;
    this.logger.debug('get_tip_block_number');
    const tipBlockNumber = await this.websocket.call('get_tip_block_number', []);
    return BI.from(tipBlockNumber).toNumber();
  }

  public async getTransactions(
    searchKey: SearchKey,
    order: 'asc' | 'desc',
    limit: string,
    after?: string,
  ): Promise<GetTransactionsResult> {
    await this.websocketReady;
    this.logger.debug(
      `get_transactions - searchKey: ${JSON.stringify(searchKey)}, order: ${order}, limit: ${limit}, after: ${after}`,
    );
    const transactions = await this.websocket.call('get_transactions', [
      searchKey,
      order,
      limit,
      after,
    ]);
    return transactions as GetTransactionsResult;
  }

  public async getCells(
    searchKey: SearchKey,
    order: 'asc' | 'desc',
    limit: string,
    after?: string,
  ): Promise<GetCellsResult> {
    await this.websocketReady;
    this.logger.debug(
      `get_cells - searchKey: ${JSON.stringify(searchKey)}, order: ${order}, limit: ${limit}, after: ${after}`,
    );
    const cells = await this.websocket.call('get_cells', [searchKey, order, limit, after]);
    return cells as GetCellsResult;
  }
}
