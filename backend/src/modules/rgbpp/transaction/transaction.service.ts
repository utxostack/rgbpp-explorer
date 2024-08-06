import { Injectable, Logger } from '@nestjs/common';
import { RgbppDigest } from 'src/core/ckb-explorer/ckb-explorer.interface';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import {
  RgbppTransaction,
  RgbppBaseTransaction,
  RgbppLatestTransactionList,
} from './transaction.model';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/env';
import { CkbRpcWebsocketService } from 'src/core/ckb-rpc/ckb-rpc-websocket.service';
import { buildRgbppLockArgs, genRgbppLockScript } from '@rgbpp-sdk/ckb/lib/utils/rgbpp';

@Injectable()
export class RgbppTransactionService {
  private logger = new Logger(RgbppTransactionService.name);

  constructor(
    private ckbExplorerService: CkbExplorerService,
    private ckbRpcService: CkbRpcWebsocketService,
    private bitcoinApiService: BitcoinApiService,
    private configService: ConfigService<Env>,
  ) { }

  public async getLatestTransactions(
    page: number,
    pageSize: number,
  ): Promise<RgbppLatestTransactionList> {
    const response = await this.ckbExplorerService.getRgbppTransactions({
      page,
      pageSize,
    });
    return {
      txs: response.data.ckb_transactions.map((tx) => RgbppTransaction.from(tx)),
      total: response.meta.total,
      pageSize: response.meta.page_size,
    };
  }

  public async getTransactionByCkbTxHash(txHash: string): Promise<RgbppBaseTransaction | null> {
    const response = await this.ckbExplorerService.getTransaction(txHash);
    if (!response.data.attributes.is_rgb_transaction) {
      return null;
    }
    return RgbppTransaction.fromCkbTransaction(response.data.attributes);
  }

  public async getTransactionByBtcTxid(txid: string): Promise<RgbppBaseTransaction | null> {
    const btcTx = await this.bitcoinApiService.getTx({ txid });
    const ckbTxs = await Promise.all(
      btcTx.vout.map(async (_, index) => {
        const args = buildRgbppLockArgs(index, btcTx.txid);
        const lock = genRgbppLockScript(args, this.configService.get('NETWORK') === 'mainnet');
        return this.ckbRpcService.getTransactions(
          {
            script: {
              code_hash: lock.codeHash,
              hash_type: lock.hashType,
              args: lock.args,
            },
            script_type: 'lock',
          },
          'asc',
          '0x64',
        );
      }),
    );
    for (const ckbTx of ckbTxs) {
      if (ckbTx.objects.length === 0) {
        continue;
      }

      for (const tx of ckbTx.objects) {
        const response = await this.ckbExplorerService.getTransaction(tx.tx_hash);
        if (response.data.attributes.is_rgb_transaction) {
          const rgbppTx = RgbppTransaction.fromCkbTransaction(response.data.attributes);
          if (rgbppTx.btcTxid === txid) {
            return rgbppTx;
          }
        }
      }
    }
    return null;
  }

  public async getTransaction(txidOrTxHash: string): Promise<RgbppBaseTransaction | null> {
    let tx: RgbppBaseTransaction | null = null;
    try {
      tx = await this.getTransactionByCkbTxHash(txidOrTxHash);
    } catch (err) {
      this.logger.error(err);
    }
    try {
      tx = await this.getTransactionByBtcTxid(txidOrTxHash);
    } catch (err) {
      this.logger.error(err);
    }
    return tx;
  }

  public async getRgbppDigest(txHash: string): Promise<RgbppDigest | null> {
    const response = await this.ckbExplorerService.getRgbppDigest(txHash);
    return response.data ?? null;
  }
}
