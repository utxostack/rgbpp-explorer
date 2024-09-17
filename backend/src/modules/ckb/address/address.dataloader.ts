import DataLoader from 'dataloader';
import { Injectable, Logger } from '@nestjs/common';
import { DataLoaderResponse } from 'src/common/dataloader';
import * as CkbExplorer from 'src/core/ckb-explorer/ckb-explorer.interface';
import {
  CkbExplorerService,
  GetAddressParams,
  GetAddressTransactionsParams,
} from 'src/core/ckb-explorer/ckb-explorer.service';
import * as Sentry from '@sentry/nestjs';
import { NestDataLoader } from 'src/common/dataloader';

@Injectable()
export class CkbAddressLoader
  implements NestDataLoader<GetAddressParams, CkbExplorer.AddressInfo[] | null>
{
  private logger = new Logger(CkbAddressLoader.name);

  constructor(private ckbExplorerService: CkbExplorerService) {}

  public getOptions() {
    return {
      cacheKeyFn: (key: GetAddressParams) => key.address,
    };
  }

  public getBatchFunction() {
    return async (batchParams: GetAddressParams[]) => {
      this.logger.debug(`Loading CKB addresses info: ${batchParams}`);
      const results = await Promise.allSettled(
        batchParams.map(async (params) => {
          const response = await this.ckbExplorerService.getAddress(params);
          return response.data.map((data) => data.attributes);
        }),
      );
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        this.logger.error(`Requesting: ${batchParams[index]}, occurred error: ${result.reason}`);
        Sentry.captureException(result.reason);
        return null;
      });
    };
  }
}
export type CkbAddressLoaderType = DataLoader<GetAddressParams, CkbExplorer.AddressInfo[] | null>;
export type CkbAddressLoaderResponse = DataLoaderResponse<CkbAddressLoader>;

export interface CkbAddressTransactionLoaderResult {
  txs: CkbExplorer.Transaction[];
  total: number;
}

@Injectable()
export class CkbAddressTransactionsLoader
  implements NestDataLoader<GetAddressTransactionsParams, CkbAddressTransactionLoaderResult | null>
{
  private logger = new Logger(CkbAddressTransactionsLoader.name);

  constructor(private ckbExplorerService: CkbExplorerService) {}

  public getOptions() {
    return {
      cacheKeyFn: (key: GetAddressTransactionsParams) => {
        const { address, sort } = key;
        return `${address}-${sort}`;
      },
    };
  }

  public getBatchFunction() {
    return async (batchParams: GetAddressParams[]) => {
      this.logger.debug(`Loading CKB address transactions: ${batchParams}`);
      const results = await Promise.allSettled(
        batchParams.map(async (params) => {
          const response = await this.ckbExplorerService.getAddressTransactions(params);
          return {
            txs: response.data.map((data) => data.attributes),
            total: response.meta.total,
          };
        }),
      );
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        this.logger.error(`Requesting: ${batchParams[index]}, occurred error: ${result.reason}`);
        Sentry.captureException(result.reason);
        return null;
      });
    };
  }
}
export type CkbAddressTransactionsLoaderType = DataLoader<
  GetAddressTransactionsParams,
  CkbAddressTransactionLoaderResult | null
>;
export type CkbAddressTransactionsLoaderResponse = DataLoaderResponse<CkbAddressTransactionsLoader>;
