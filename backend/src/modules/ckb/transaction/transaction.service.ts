import { Injectable } from '@nestjs/common';
import { CkbRpcWebsocketService } from 'src/core/ckb-rpc/ckb-rpc-websocket.service';

@Injectable()
export class CkbTransactionService {
  constructor(private ckbRpcService: CkbRpcWebsocketService) {}

  public async getTransaction(txHash: string) {
    return this.ckbRpcService.getTransaction(txHash);
  }
}
