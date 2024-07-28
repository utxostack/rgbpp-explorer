import { Module } from '@nestjs/common';
import { BitcoinApiModule } from 'src/core/bitcoin-api/bitcoin-api.module';
import { BitcoinTransactionResolver } from './transaction.resolver';
import {
  BitcoinTransactionLoader,
  BitcoinTransactionOutSpendsLoader,
} from './transaction.dataloader';

@Module({
  imports: [BitcoinApiModule],
  providers: [
    BitcoinTransactionResolver,
    BitcoinTransactionLoader,
    BitcoinTransactionOutSpendsLoader,
  ],
  exports: [BitcoinTransactionLoader, BitcoinTransactionOutSpendsLoader],
})
export class BitcoinTransactionModule {}
