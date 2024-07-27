import DataLoader from 'dataloader';
import { Injectable, Logger } from '@nestjs/common';
import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import { DataLoaderResponse } from 'src/common/type/dataloader';
import * as CkbExplorerInterface from 'src/core/ckb-explorer/ckb-explorer.interface';
import {
  CkbExplorerService,
  GetAddressParams,
  GetAddressTransactionsParams,
} from 'src/core/ckb-explorer/ckb-explorer.service';

@Injectable()
export class CkbAddressLoader
  implements NestDataLoader<GetAddressParams, CkbExplorerInterface.AddressInfo[]>
{
  private logger = new Logger(CkbAddressLoader.name);

  constructor(private ckbExplorerService: CkbExplorerService) {}

  public getBatchFunction() {
    return (batchParams: GetAddressParams[]) => {
      this.logger.debug(`Loading CKB addresses info: ${batchParams}`);
      return Promise.all(
        batchParams.map(async (params) => {
          const response = await this.ckbExplorerService.getAddress(params);
          return response.data.map((data) => data.attributes);
        }),
      );
    };
  }
}
export type CkbAddressLoaderType = DataLoader<GetAddressParams, CkbExplorerInterface.AddressInfo[]>;
export type CkbAddressLoaderResponse = DataLoaderResponse<CkbAddressLoader>;

export interface CkbAddressTransactionLoaderResult {
  txs: CkbExplorerInterface.Transaction[];
  total: number;
}

@Injectable()
export class CkbAddressTransactionsLoader
  implements NestDataLoader<GetAddressTransactionsParams, CkbAddressTransactionLoaderResult>
{
  private logger = new Logger(CkbAddressTransactionsLoader.name);

  constructor(private ckbExplorerService: CkbExplorerService) {}

  public getBatchFunction() {
    return (batchParams: GetAddressParams[]) => {
      this.logger.debug(`Loading CKB address transactions: ${batchParams}`);
      return Promise.all(
        batchParams.map(async (params) => {
          const response = await this.ckbExplorerService.getAddressTransactions(params);
          return {
            txs: response.data.map((data) => data.attributes),
            total: response.meta.total,
          };
        }),
      );
    };
  }
}
export type CkbAddressTransactionsLoaderType = DataLoader<
  GetAddressTransactionsParams,
  CkbAddressTransactionLoaderResult
>;
export type CkbAddressTransactionsLoaderResponse = DataLoaderResponse<CkbAddressTransactionsLoader>;
