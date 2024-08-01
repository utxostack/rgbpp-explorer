import { Injectable } from '@nestjs/common';
import * as CkbRpc from 'src/core/ckb-rpc/ckb-rpc.interface';
import * as CkbExplorer from 'src/core/ckb-explorer/ckb-explorer.interface';
import { CkbRpcWebsocketService } from 'src/core/ckb-rpc/ckb-rpc-websocket.service';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import { CkbSearchKeyInput } from './transaction.model';
import { BI } from '@ckb-lumos/bi';

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

  public async getTransactions(
    searchKey: CkbSearchKeyInput,
    order: 'asc' | 'desc' = 'desc',
    limit: number,
    after?: string,
  ): Promise<CkbRpc.GetTransactionsResult> {
    return this.ckbRpcService.getTransactions(
      {
        script: {
          code_hash: searchKey.script.codeHash,
          hash_type: searchKey.script.hashType,
          args: searchKey.script.args,
        },
        script_type: searchKey.scriptType,
      },
      order,
      BI.from(limit).toHexString(),
      after,
    );
  }
}
