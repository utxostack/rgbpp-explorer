import { Module } from '@nestjs/common';
import { BitcoinTransactionModule } from './transaction/transaction.module';
import { BitcoinResolver } from './bitcoin.resolver';
import { BitcoinApiModule } from 'src/core/bitcoin-api/bitcoin-api.module';

@Module({
  imports: [BitcoinApiModule, BitcoinTransactionModule],
  providers: [BitcoinResolver],
})
export class BitcoinModule {}
