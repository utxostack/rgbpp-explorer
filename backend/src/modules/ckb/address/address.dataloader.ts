import DataLoader from 'dataloader';
import { Injectable, Logger } from '@nestjs/common';
import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import { DataLoaderResponse } from 'src/common/type/dataloader';
import * as CkbExplorer from 'src/core/ckb-explorer/ckb-explorer.interface';
import {
  CkbExplorerService,
  GetAddressParams,
  GetAddressTransactionsParams,
} from 'src/core/ckb-explorer/ckb-explorer.service';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';

@Injectable()
export class CkbAddressLoader
  implements NestDataLoader<GetAddressParams, CkbExplorer.AddressInfo[] | void>
{
  private logger = new Logger(CkbAddressLoader.name);

  constructor(
    private ckbExplorerService: CkbExplorerService,
    @InjectSentry() private sentryService: SentryService,
  ) {}

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
        if (result.reason instanceof Error) {
          this.logger.error(`Requesting: ${batchParams[index]}, occurred error: ${result.reason}`);
          this.sentryService.instance().captureException(result.reason);
        }
      });
    };
  }
}
export type CkbAddressLoaderType = DataLoader<GetAddressParams, CkbExplorer.AddressInfo[] | void>;
export type CkbAddressLoaderResponse = DataLoaderResponse<CkbAddressLoader>;

export interface CkbAddressTransactionLoaderResult {
  txs: CkbExplorer.Transaction[];
  total: number;
}

@Injectable()
export class CkbAddressTransactionsLoader
  implements NestDataLoader<GetAddressTransactionsParams, CkbAddressTransactionLoaderResult | void>
{
  private logger = new Logger(CkbAddressTransactionsLoader.name);

  constructor(
    private ckbExplorerService: CkbExplorerService,
    @InjectSentry() private sentryService: SentryService,
  ) {}

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
        if (result.reason instanceof Error) {
          this.logger.error(`Requesting: ${batchParams[index]}, occurred error: ${result.reason}`);
          this.sentryService.instance().captureException(result.reason);
        }
      });
    };
  }
}
export type CkbAddressTransactionsLoaderType = DataLoader<
  GetAddressTransactionsParams,
  CkbAddressTransactionLoaderResult | void
>;
export type CkbAddressTransactionsLoaderResponse = DataLoaderResponse<CkbAddressTransactionsLoader>;
