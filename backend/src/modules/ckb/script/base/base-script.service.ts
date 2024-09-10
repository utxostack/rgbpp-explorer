import { BI, Script } from '@ckb-lumos/lumos';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isScriptEqual } from '@rgbpp-sdk/ckb';
import { CkbRpcWebsocketService } from 'src/core/ckb-rpc/ckb-rpc-websocket.service';
import { SearchKey } from 'src/core/ckb-rpc/ckb-rpc.interface';
import * as CkbRpc from 'src/core/ckb-rpc/ckb-rpc.interface';
import { Env } from 'src/env';
import { CellType } from '../script.model';
import { OrderType } from 'src/modules/api.model';
import * as Sentry from '@sentry/nestjs';

export abstract class BaseScriptService {
  protected logger = new Logger(BaseScriptService.name);
  abstract type: CellType;

  constructor(
    protected configService: ConfigService<Env>,
    protected ckbRpcService: CkbRpcWebsocketService,
  ) {}

  public static sortTransactionCmp(a: CkbRpc.IndexerCell, b: CkbRpc.IndexerCell, order: OrderType) {
    const blockNumberCmp = BI.from(b.block_number).sub(BI.from(a.block_number)).toNumber();
    if (blockNumberCmp !== 0) {
      return order === OrderType.Desc ? blockNumberCmp : -blockNumberCmp;
    }
    const txIndexCmp = BI.from(b.tx_index).sub(BI.from(a.tx_index)).toNumber();
    return order === OrderType.Desc ? txIndexCmp : -txIndexCmp;
  }

  public abstract getScripts(): Script[];

  public matchScript(script: Script) {
    const scripts = this.getScripts();
    return scripts.some((s) => isScriptEqual(s, { ...script, args: '0x' }));
  }

  public async getTransactions(
    limit: number = 10,
    order: OrderType = OrderType.Desc,
    after?: string,
  ) {
    const scripts = this.getScripts();
    const result = await Promise.allSettled(
      scripts.map(async (script) => {
        const searchKey: SearchKey = {
          script: {
            code_hash: script.codeHash,
            hash_type: script.hashType,
            args: '0x',
          },
          script_type: 'type',
        };
        const txs = await this.ckbRpcService.getTransactions(
          searchKey,
          order,
          BI.from(limit).toHexString(),
          after,
        );
        return txs;
      }),
    );
    const transactions: CkbRpc.GetTransactionsResult[] = [];
    result.forEach((r) => {
      if (r.status === 'fulfilled') {
        transactions.push(r.value);
      } else {
        this.logger.error(r.reason);
        Sentry.captureException(r.reason);
      }
    });
    return transactions
      .map((tx) => tx.objects)
      .flat()
      .sort((a, b) => BaseScriptService.sortTransactionCmp(a, b, order))
      .slice(0, limit);
  }
}
