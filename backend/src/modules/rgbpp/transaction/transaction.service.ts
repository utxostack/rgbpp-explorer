import { Injectable } from '@nestjs/common';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import { RgbppBaseTransaction, RgbppTransaction } from './transaction.model';

@Injectable()
export class RgbppTransactionService {
  constructor(
    private ckbExplorerService: CkbExplorerService,
    private bitcoinApiService: BitcoinApiService,
  ) { }

  public async getLatestTransactions(
    page: number,
    pageSize: number,
  ): Promise<RgbppBaseTransaction[]> {
    const response = await this.ckbExplorerService.getRgbppTransactions({
      page,
      pageSize,
    });
    return response.data.ckb_transactions.map((transaction) => RgbppTransaction.from(transaction));
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
}
