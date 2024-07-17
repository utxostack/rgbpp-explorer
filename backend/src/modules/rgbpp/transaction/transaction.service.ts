import { Injectable } from '@nestjs/common';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';

@Injectable()
export class RgbppTransactionService {
  constructor(private ckbExplorerService: CkbExplorerService) {}

  public async getLatestTransaction(pageSize: number = 10) {
    const response = await this.ckbExplorerService.getRgbppTransactions({
      pageSize,
    });
    return response.data.ckb_transactions;
  }
}

