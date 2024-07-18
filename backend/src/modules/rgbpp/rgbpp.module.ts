import { Module } from '@nestjs/common';
import { TransactionModule } from './transaction/transaction.module';
import { CoinModule } from './coin/coin.module';

@Module({
  imports: [TransactionModule, CoinModule]
})
export class RgbppModule {}
