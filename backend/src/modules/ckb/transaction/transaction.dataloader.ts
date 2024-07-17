import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import { Injectable, Logger } from '@nestjs/common';
import { CkbTransactionService } from './transaction.service';
import * as CkbRpc from 'src/core/ckb-rpc/ckb-rpc.interface';

export type CkbTransactionLoaderResponse = CkbRpc.TransactionWithStatusResponse;

@Injectable()
export class CkbTransactionLoader implements NestDataLoader<string, CkbTransactionLoaderResponse> {
  private logger = new Logger(CkbTransactionLoader.name);

  constructor(private transactionService: CkbTransactionService) {}

  public getBatchFunction() {
    return (hashs: string[]) => {
      this.logger.debug(`Loading transactions: ${hashs.join(', ')}`);
      return Promise.all(hashs.map((key) => this.transactionService.getTransaction(key)));
    };
  }
}
