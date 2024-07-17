import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client as RpcWebsocketsClient } from 'rpc-websockets';
import { Env } from 'src/env';
import { TransactionWithStatusResponse } from './ckb-rpc.interface';

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
}
