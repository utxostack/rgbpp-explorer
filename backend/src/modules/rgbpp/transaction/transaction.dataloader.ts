import DataLoader from 'dataloader';
import { Injectable, Logger } from '@nestjs/common';
import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import { DataLoaderResponse } from 'src/common/type/dataloader';
import { RgbppTransactionService } from './transaction.service';
import { RgbppTransaction } from './transaction.model';
import * as Sentry from '@sentry/nestjs';

@Injectable()
export class RgbppTransactionLoader implements NestDataLoader<string, RgbppTransaction | null> {
  private logger = new Logger(RgbppTransactionLoader.name);

  constructor(private transactionService: RgbppTransactionService) {}

  public getBatchFunction() {
    return async (ids: string[]) => {
      this.logger.debug(`Loading rgbpp transactions: ${ids.join(', ')}`);
      const results = await Promise.allSettled(
        ids.map((txidOrTxHash) => this.transactionService.getTransaction(txidOrTxHash)),
      );
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        this.logger.error(`Requesting: ${ids[index]}, occurred error: ${result.reason}`);
        Sentry.captureException(result.reason);
        return null;
      });
    };
  }
}
export type RgbppTransactionLoaderType = DataLoader<string, RgbppTransaction | null>;
export type RgbppTransactionLoaderResponse = DataLoaderResponse<RgbppTransactionLoader>;
