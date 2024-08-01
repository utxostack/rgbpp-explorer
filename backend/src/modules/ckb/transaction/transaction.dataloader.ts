import DataLoader from 'dataloader';
import { Injectable, Logger } from '@nestjs/common';
import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import { DataLoaderResponse } from 'src/common/type/dataloader';
import * as CkbRpcInterface from 'src/core/ckb-rpc/ckb-rpc.interface';
import * as CkbExplorerInterface from 'src/core/ckb-explorer/ckb-explorer.interface';
import { CkbTransactionService } from './transaction.service';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';

@Injectable()
export class CkbRpcTransactionLoader
  implements NestDataLoader<string, CkbRpcInterface.TransactionWithStatusResponse | void>
{
  private logger = new Logger(CkbRpcTransactionLoader.name);

  constructor(
    private transactionService: CkbTransactionService,
    @InjectSentry() private sentryService: SentryService,
  ) {}

  public getBatchFunction() {
    return async (hashes: string[]) => {
      this.logger.debug(`Loading CKB transactions from CkbRpcService: ${hashes.join(', ')}`);
      const results = await Promise.allSettled(
        hashes.map((key) => this.transactionService.getTransactionFromRpc(key)),
      );
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        this.logger.error(`Requesting: ${hashes[index]}, occurred error: ${result.reason}`);
        this.sentryService.instance().captureException(result.reason);
        return null;
      });
    };
  }
}
export type CkbRpcTransactionLoaderType = DataLoader<
  string,
  CkbRpcInterface.TransactionWithStatusResponse | void
>;
export type CkbRpcTransactionLoaderResponse = DataLoaderResponse<CkbRpcTransactionLoader>;

@Injectable()
export class CkbExplorerTransactionLoader
  implements NestDataLoader<string, CkbExplorerInterface.DetailTransaction | void>
{
  private logger = new Logger(CkbExplorerTransactionLoader.name);

  constructor(
    private transactionService: CkbTransactionService,
    @InjectSentry() private sentryService: SentryService,
  ) {}

  public getBatchFunction() {
    return async (hashes: string[]) => {
      this.logger.debug(`Loading CKB transactions from CkbExplorerService: ${hashes.join(', ')}`);
      const results = await Promise.allSettled(
        hashes.map((key) => this.transactionService.getTransactionFromExplorer(key)),
      );
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        this.logger.error(`Requesting: ${hashes[index]}, occurred error: ${result.reason}`);
        this.sentryService.instance().captureException(result.reason);
        return null;
      });
    };
  }
}
export type CkbExplorerTransactionLoaderType = DataLoader<
  string,
  CkbExplorerInterface.DetailTransaction | void
>;
export type CkbExplorerTransactionLoaderResponse = DataLoaderResponse<CkbExplorerTransactionLoader>;
