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
import { Cacheable } from 'src/decorators/cacheable.decorator';
import { ONE_MONTH_MS } from 'src/common/date';
import { CKB_MIN_SAFE_CONFIRMATIONS } from 'src/constants';
import * as Sentry from '@sentry/nestjs';
import { Chain } from '@prisma/client';
import { PLimit } from 'src/decorators/plimit.decorator';

class WebsocketError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebsocketError';
  }
}

export class BlockchainService {
  private logger = new Logger(BlockchainService.name);

  private websocket: RpcWebsocketsClient;
  private websocketReady: Promise<void>;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;

  constructor(
    public chainId: number,
    private chainPromise: Promise<Chain | null>,
  ) {
    this.createConnection();
  }

  private createConnection() {
    this.websocketReady = new Promise(async (resolve, reject) => {
      const chain = await this.chainPromise;
      if (!chain) {
        reject(new Error(`Chain with id ${this.chainId} not found`));
        return;
      }

      this.websocket = new RpcWebsocketsClient(chain.ws);
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
        Sentry.captureException(webSocketError);
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
      Sentry.captureException(error);
    }
  }

  public async close(): Promise<void> {
    if (this.websocket) {
      this.websocket.close();
    }
  }

  private async isSafeConfirmations(blockNumber: string): Promise<boolean> {
    const tipBlockNumber = await this.getTipBlockNumber();
    return BI.from(blockNumber).lt(BI.from(tipBlockNumber).sub(CKB_MIN_SAFE_CONFIRMATIONS));
  }

  @Cacheable({
    namespace: 'BlockchainService',
    key: (txHash: string, withData: boolean, withWitness: boolean) => {
      let key = `getTransaction:${txHash}`;
      if (withData) {
        key += ':withData';
      }
      if (withWitness) {
        key += ':withWitness';
      }
      return key;
    },
    ttl: ONE_MONTH_MS,
    shouldCache: async (tx: TransactionWithStatusResponse, that: BlockchainService) => {
      if (tx.tx_status.status !== 'committed' || !tx.tx_status.block_number) {
        return false;
      }
      return that.isSafeConfirmations(tx.tx_status.block_number);
    },
  })
  public async getTransaction(
    txHash: string,
    withData: boolean = false,
    withWitness: boolean = false,
  ): Promise<TransactionWithStatusResponse> {
    await this.websocketReady;
    this.logger.debug(`get_transaction - txHash: ${txHash}`);
    const response = await this.websocket.call('get_transaction', [txHash]);
    const tx = response as TransactionWithStatusResponse;
    // XXX: we don't need these fields by default, remove them to save cache/memory space
    if (!withData) {
      tx.transaction.outputs_data = [];
    }
    if (!withWitness) {
      tx.transaction.witnesses = [];
    }
    return tx;
  }

  @Cacheable({
    namespace: 'BlockchainService',
    key: (blockHash: string, withTxData: boolean, withTxWitness: boolean) => {
      let key = `getBlock:${blockHash}`;
      if (withTxData) {
        key += ':withTxData';
      }
      if (withTxWitness) {
        key += ':withTxWitness';
      }
      return key;
    },
    ttl: ONE_MONTH_MS,
    shouldCache: async (block: Block, that: BlockchainService) => {
      if (!block?.header) {
        return false;
      }
      const { number } = block.header;
      return that.isSafeConfirmations(number);
    },
  })
  public async getBlock(
    blockHash: string,
    withTxData: boolean = false,
    withTxWitness: boolean = false,
  ): Promise<Block> {
    await this.websocketReady;
    this.logger.debug(`get_block - blockHash: ${blockHash}`);
    const response = await this.websocket.call('get_block', [blockHash]);
    const block = response as Block;
    if (!withTxData) {
      block.transactions = block.transactions.map((tx) => {
        tx.outputs_data = [];
        return tx;
      });
    }
    if (!withTxWitness) {
      block.transactions = block.transactions.map((tx) => {
        tx.witnesses = [];
        return tx;
      });
    }
    return block;
  }

  @Cacheable({
    namespace: 'BlockchainService',
    key: (blockNumber: string, withTxData: boolean, withTxWitness: boolean) => {
      let key = `getBlockByNumber:${blockNumber}`;
      if (withTxData) {
        key += ':withTxData';
      }
      if (withTxWitness) {
        key += ':withTxWitness';
      }
      return key;
    },
    ttl: ONE_MONTH_MS,
    shouldCache: async (block: Block, that: BlockchainService) => {
      const { number } = block.header;
      return that.isSafeConfirmations(number);
    },
  })
  public async getBlockByNumber(
    blockNumber: string,
    withTxData: boolean = false,
    withTxWitness: boolean = false,
  ): Promise<Block> {
    await this.websocketReady;
    this.logger.debug(`get_block_by_number - blockNumber: ${blockNumber}`);
    const response = await this.websocket.call('get_block_by_number', [
      BI.from(blockNumber).toHexString(),
    ]);
    const block = response as Block;
    if (!withTxData) {
      block.transactions = block.transactions.map((tx) => {
        tx.outputs_data = [];
        return tx;
      });
    }
    if (!withTxWitness) {
      block.transactions = block.transactions.map((tx) => {
        tx.witnesses = [];
        return tx;
      });
    }
    return block;
  }

  @Cacheable({
    namespace: 'BlockchainService',
    key: (blockHash: string) => `getBlockEconomicState:${blockHash}`,
    ttl: ONE_MONTH_MS,
  })
  public async getBlockEconomicState(blockHash: string): Promise<BlockEconomicState> {
    await this.websocketReady;
    this.logger.debug(`get_block_economic_state - blockHash: ${blockHash}`);
    const blockEconomicState = await this.websocket.call('get_block_economic_state', [blockHash]);
    return blockEconomicState as BlockEconomicState;
  }

  @Cacheable({
    namespace: 'BlockchainService',
    key: 'getTipBlockNumber',
    // just cache for 1 second to avoid too many requests
    ttl: 1000,
  })
  public async getTipBlockNumber(): Promise<number> {
    await this.websocketReady;
    this.logger.debug('get_tip_block_number');
    const tipBlockNumber = await this.websocket.call('get_tip_block_number', []);
    return BI.from(tipBlockNumber).toNumber();
  }

  @PLimit({ concurrency: 100 })
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
    const result = await this.websocket.call('get_transactions', [searchKey, order, limit, after]);
    const transactions = result as GetTransactionsResult;
    return transactions;
  }

  public async getCells(
    searchKey: SearchKey,
    order: 'asc' | 'desc',
    limit: string,
    after?: string,
    withData: boolean = false,
  ): Promise<GetCellsResult> {
    await this.websocketReady;
    this.logger.debug(
      `get_cells - searchKey: ${JSON.stringify(searchKey)}, order: ${order}, limit: ${limit}, after: ${after}`,
    );
    const result = await this.websocket.call('get_cells', [searchKey, order, limit, after]);
    const cells = result as GetCellsResult;
    cells.objects = cells.objects.map((cell) => {
      if (!withData) {
        cell.output_data = '';
      }
      return cell;
    });
    return cells;
  }
}
