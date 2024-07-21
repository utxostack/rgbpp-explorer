import { Module } from '@nestjs/common';
import { CoinModule } from './coin/coin.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [TransactionModule, CoinModule],
})
export class RgbppModule {}
