import DataLoader from 'dataloader';
import { Injectable, Logger } from '@nestjs/common';
import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import { DataLoaderResponse } from 'src/common/type/dataloader';
import { RgbppTransactionService } from './transaction.service';
import { RgbppBaseTransaction } from './transaction.model';

@Injectable()
export class RgbppTransactionLoader implements NestDataLoader<string, RgbppBaseTransaction | null> {
  private logger = new Logger(RgbppTransactionLoader.name);

  constructor(private transactionService: RgbppTransactionService) {}

  public getBatchFunction() {
    return async (ids: string[]) => {
      this.logger.debug(`Loading rgbpp transactions: ${ids.join(', ')}`);
      const results = await Promise.allSettled(
        ids.map((txidOrTxHash) => this.transactionService.getTransaction(txidOrTxHash)),
      );
      return results.map((result) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        return null;
      });
    };
  }
}
export type RgbppTransactionLoaderType = DataLoader<string, RgbppBaseTransaction | null>;
export type RgbppTransactionLoaderResponse = DataLoaderResponse<RgbppTransactionLoader>;
