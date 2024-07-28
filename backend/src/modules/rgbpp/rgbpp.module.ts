import { Module } from '@nestjs/common';
import { RgbppCoinModule } from './coin/coin.module';
import { RgbppStatisticModule } from './statistic/statistic.module';
import { RgbppTransactionModule } from './transaction/transaction.module';

@Module({
  imports: [RgbppTransactionModule, RgbppCoinModule, RgbppStatisticModule],
})
export class RgbppModule {}
