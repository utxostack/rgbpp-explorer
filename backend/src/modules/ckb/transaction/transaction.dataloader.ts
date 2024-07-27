import DataLoader from 'dataloader';
import { Injectable, Logger } from '@nestjs/common';
import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import { DataLoaderResponse } from 'src/common/type/dataloader';
import * as CkbRpcInterface from 'src/core/ckb-rpc/ckb-rpc.interface';
import * as CkbExplorerInterface from 'src/core/ckb-explorer/ckb-explorer.interface';
import { CkbTransactionService } from './transaction.service';

@Injectable()
export class CkbRpcTransactionLoader
  implements NestDataLoader<string, CkbRpcInterface.TransactionWithStatusResponse>
{
  private logger = new Logger(CkbRpcTransactionLoader.name);

  constructor(private transactionService: CkbTransactionService) {}

  public getBatchFunction() {
    return (hashes: string[]) => {
      this.logger.debug(`Loading CKB transactions from CkbRpcService: ${hashes.join(', ')}`);
      return Promise.all(hashes.map((key) => this.transactionService.getTransactionFromRpc(key)));
    };
  }
}
export type CkbRpcTransactionLoaderType = DataLoader<
  string,
  CkbRpcInterface.TransactionWithStatusResponse
>;
export type CkbRpcTransactionLoaderResponse = DataLoaderResponse<CkbRpcTransactionLoader>;

@Injectable()
export class CkbExplorerTransactionLoader
  implements NestDataLoader<string, CkbExplorerInterface.DetailTransaction>
{
  private logger = new Logger(CkbExplorerTransactionLoader.name);

  constructor(private transactionService: CkbTransactionService) {}

  public getBatchFunction() {
    return (hashes: string[]) => {
      this.logger.debug(`Loading CKB transactions from CkbExplorerService: ${hashes.join(', ')}`);
      return Promise.all(
        hashes.map((key) => this.transactionService.getTransactionFromExplorer(key)),
      );
    };
  }
}
export type CkbExplorerTransactionLoaderType = DataLoader<
  string,
  CkbExplorerInterface.DetailTransaction
>;
export type CkbExplorerTransactionLoaderResponse = DataLoaderResponse<CkbExplorerTransactionLoader>;
