import { Injectable } from '@nestjs/common';
import { RgbppDigest } from 'src/core/ckb-explorer/ckb-explorer.interface';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import {
  RgbppTransaction,
  RgbppBaseTransaction,
  RgbppLatestTransactionList,
} from './transaction.model';

@Injectable()
export class RgbppTransactionService {
  constructor(
    private ckbExplorerService: CkbExplorerService,
    private bitcoinApiService: BitcoinApiService,
  ) {}

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
    // TODO: implement this method
    const response = await this.bitcoinApiService.getTx({ txid });
    return null;
  }

  public async getRgbppDigest(txHash: string): Promise<RgbppDigest | null> {
    const response = await this.ckbExplorerService.getRgbppDigest(txHash);
    return response.data ?? null;
  }
}
