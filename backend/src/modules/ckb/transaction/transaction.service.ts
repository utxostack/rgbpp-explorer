import { Injectable } from '@nestjs/common';
import * as CkbRpc from 'src/core/ckb-rpc/ckb-rpc.interface';
import * as CkbExplorer from 'src/core/ckb-explorer/ckb-explorer.interface';
import { CkbRpcWebsocketService } from 'src/core/ckb-rpc/ckb-rpc-websocket.service';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';

@Injectable()
export class CkbTransactionService {
  constructor(
    private ckbRpcService: CkbRpcWebsocketService,
    private ckbExplorerService: CkbExplorerService,
  ) {}

  public async getTransactionFromRpc(
    txHash: string,
  ): Promise<CkbRpc.TransactionWithStatusResponse> {
    return this.ckbRpcService.getTransaction(txHash);
  }

  public async getTransactionFromExplorer(txHash: string): Promise<CkbExplorer.DetailTransaction> {
    const res = await this.ckbExplorerService.getTransaction(txHash);
    return res.data.attributes;
  }

  public async getTipBlockNumber(): Promise<number> {
    return this.ckbRpcService.getTipBlockNumber();
  }
}
