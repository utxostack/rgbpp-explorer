import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import { Injectable, Logger } from '@nestjs/common';
import DataLoader from 'dataloader';
import { DataLoaderResponse } from 'src/common/type/dataloader';
import * as CkbExplorerInterface from 'src/core/ckb-explorer/ckb-explorer.interface';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import * as Sentry from '@sentry/nestjs';

export interface CkbExplorerXUDTTransactionsLoaderKey {
  typeHash: string;
  page: number;
  pageSize: number;
  txHash?: string;
  addressHash?: string;
}

@Injectable()
export class CkbExplorerXUDTTransactionsLoader
  implements
    NestDataLoader<
      CkbExplorerXUDTTransactionsLoaderKey,
      CkbExplorerInterface.PaginatedResponse<CkbExplorerInterface.Transaction> | null
    >
{
  private logger = new Logger(CkbExplorerXUDTTransactionsLoader.name);

  constructor(private ckbExplorerService: CkbExplorerService) {}

  public getBatchFunction() {
    return async (keys: CkbExplorerXUDTTransactionsLoaderKey[]) => {
      this.logger.debug(`Loading XUDT transactions from CkbExplorerService: ${keys.join(', ')}`);
      const results = await Promise.allSettled(
        keys.map(async (params) => {
          const { typeHash, page, pageSize, txHash, addressHash } = params;
          const txs = await this.ckbExplorerService.getXUDTTransactions(typeHash, {
            page,
            pageSize,
            txHash,
            addressHash,
          });
          return txs;
        }),
      );
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        this.logger.error(
          `Requesting: ${JSON.stringify(keys[index])}, occurred error: ${result.reason}`,
        );
        Sentry.captureException(result.reason);
        return null;
      });
    };
  }
}
export type CkbExplorerXUDTTransactionsLoaderType = DataLoader<
  CkbExplorerXUDTTransactionsLoaderKey,
  CkbExplorerInterface.PaginatedResponse<CkbExplorerInterface.Transaction> | null
>;
export type CkbExplorerXUDTTransactionsLoaderResponse =
  DataLoaderResponse<CkbExplorerXUDTTransactionsLoader>;
