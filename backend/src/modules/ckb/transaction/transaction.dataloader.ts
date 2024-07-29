import DataLoader from 'dataloader';
import { Injectable, Logger } from '@nestjs/common';
import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import { DataLoaderResponse } from 'src/common/type/dataloader';
import * as CkbRpcInterface from 'src/core/ckb-rpc/ckb-rpc.interface';
import * as CkbExplorerInterface from 'src/core/ckb-explorer/ckb-explorer.interface';
import { CkbTransactionService } from './transaction.service';

@Injectable()
export class CkbRpcTransactionLoader
  implements NestDataLoader<string, CkbRpcInterface.TransactionWithStatusResponse | null>
{
  private logger = new Logger(CkbRpcTransactionLoader.name);

  constructor(private transactionService: CkbTransactionService) {}

  public getBatchFunction() {
    return async (hashes: string[]) => {
      this.logger.debug(`Loading CKB transactions from CkbRpcService: ${hashes.join(', ')}`);
      const results = await Promise.allSettled(
        hashes.map((key) => this.transactionService.getTransactionFromRpc(key)),
      );
      return results.map((result) => (result.status === 'fulfilled' ? result.value : null));
    };
  }
}
export type CkbRpcTransactionLoaderType = DataLoader<
  string,
  CkbRpcInterface.TransactionWithStatusResponse | null
>;
export type CkbRpcTransactionLoaderResponse = DataLoaderResponse<CkbRpcTransactionLoader>;

@Injectable()
export class CkbExplorerTransactionLoader
  implements NestDataLoader<string, CkbExplorerInterface.DetailTransaction | null>
{
  private logger = new Logger(CkbExplorerTransactionLoader.name);

  constructor(private transactionService: CkbTransactionService) {}

  public getBatchFunction() {
    return async (hashes: string[]) => {
      this.logger.debug(`Loading CKB transactions from CkbExplorerService: ${hashes.join(', ')}`);
      const results = await Promise.allSettled(
        hashes.map((key) => this.transactionService.getTransactionFromExplorer(key)),
      );
      return results.map((result) => (result.status === 'fulfilled' ? result.value : null));
    };
  }
}
export type CkbExplorerTransactionLoaderType = DataLoader<
  string,
  CkbExplorerInterface.DetailTransaction | null
>;
export type CkbExplorerTransactionLoaderResponse = DataLoaderResponse<CkbExplorerTransactionLoader>;
