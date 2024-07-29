import { Module } from '@nestjs/common';
import { RgbppCoinModule } from './coin/coin.module';
import { RgbppStatisticModule } from './statistic/statistic.module';
import { RgbppTransactionModule } from './transaction/transaction.module';
import { RgbppAddressModule } from './address/address.module';

@Module({
  imports: [RgbppAddressModule, RgbppTransactionModule, RgbppCoinModule, RgbppStatisticModule],
})
export class RgbppModule { }
