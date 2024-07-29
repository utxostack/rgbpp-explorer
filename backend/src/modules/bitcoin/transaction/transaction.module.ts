import { Module } from '@nestjs/common';
import { BitcoinApiModule } from 'src/core/bitcoin-api/bitcoin-api.module';
import { BitcoinTransactionResolver } from './transaction.resolver';
import {
  BitcoinTransactionLoader,
  BitcoinTransactionOutSpendsLoader,
} from './transaction.dataloader';
import { RgbppTransactionModule } from 'src/modules/rgbpp/transaction/transaction.module';

@Module({
  imports: [BitcoinApiModule, RgbppTransactionModule],
  providers: [
    BitcoinTransactionResolver,
    BitcoinTransactionLoader,
    BitcoinTransactionOutSpendsLoader,
  ],
  exports: [BitcoinTransactionLoader, BitcoinTransactionOutSpendsLoader],
})
export class BitcoinTransactionModule {}
