import DataLoader from 'dataloader';
import { Injectable, Logger } from '@nestjs/common';
import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import { DataLoaderResponse } from 'src/common/type/dataloader';
import { RgbppTransactionService } from './transaction.service';
import { RgbppBaseTransaction } from './transaction.model';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';

@Injectable()
export class RgbppTransactionLoader implements NestDataLoader<string, RgbppBaseTransaction | null> {
  private logger = new Logger(RgbppTransactionLoader.name);

  constructor(
    private transactionService: RgbppTransactionService,
    @InjectSentry() private sentryService: SentryService,
  ) {}

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
        this.sentryService.instance().captureException(result.reason);
        return null;
      });
    };
  }
}
export type RgbppTransactionLoaderType = DataLoader<string, RgbppBaseTransaction | null>;
export type RgbppTransactionLoaderResponse = DataLoaderResponse<RgbppTransactionLoader>;
