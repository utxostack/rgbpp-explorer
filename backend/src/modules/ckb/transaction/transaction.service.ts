import { Injectable } from '@nestjs/common';
import * as CkbRpc from 'src/core/ckb-rpc/ckb-rpc.interface';
import * as CkbExplorer from 'src/core/ckb-explorer/ckb-explorer.interface';
import { CkbRpcWebsocketService } from 'src/core/ckb-rpc/ckb-rpc-websocket.service';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import { CkbSearchKeyInput } from './transaction.model';
import { BI } from '@ckb-lumos/bi';
import { OrderType } from 'src/modules/api.model';
import { Cacheable } from 'src/decorators/cacheable.decorator';

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

  @Cacheable({
    namespace: 'CkbTransactionService',
    key: (searchKey: CkbSearchKeyInput, order: OrderType, limit: number, after?: string) =>
      `getTransactions:${JSON.stringify(searchKey)}:${order}:${limit}:${after}`,
    ttl: 10_000,
  })
  public async getTransactions(
    searchKey: CkbSearchKeyInput,
    order: OrderType = OrderType.Desc,
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
