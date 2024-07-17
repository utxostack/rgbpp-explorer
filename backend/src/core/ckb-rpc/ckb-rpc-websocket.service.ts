import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client as RpcWebsocketsClient } from 'rpc-websockets';
import { Env } from 'src/env';
import { Block, BlockEconomicState, TransactionWithStatusResponse } from './ckb-rpc.interface';
import { BI } from '@ckb-lumos/bi';

@Injectable()
export class CkbRpcWebsocketService {
  private logger = new Logger(CkbRpcWebsocketService.name);
  private websocket: RpcWebsocketsClient;

  constructor(private configService: ConfigService<Env>) {
    this.websocket = new RpcWebsocketsClient(this.configService.get('CKB_RPC_WEBSOCKET_URL'));
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
}
