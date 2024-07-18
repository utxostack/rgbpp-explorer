import { Module } from '@nestjs/common';
import { BitcoinApiModule } from 'src/core/bitcoin-api/bitcoin-api.module';
import { BitcoinTransactionResolver } from './transaction.resolver';
import { BitcoinTransactionLoader } from './transaction.dataloader';

@Module({
  imports: [BitcoinApiModule],
  providers: [BitcoinTransactionResolver, BitcoinTransactionLoader],
  exports: [BitcoinTransactionLoader],
})
export class BitcoinTransactionModule {}
