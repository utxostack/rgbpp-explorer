import { Module } from '@nestjs/common';
import { BitcoinApiModule } from 'src/core/bitcoin-api/bitcoin-api.module';
import { BitcoinTransactionOutSpendsLoader } from '../transaction/transaction.dataloader';
import { BitcoinOutputResolver } from './output.resolver';

@Module({
  imports: [BitcoinApiModule],
  providers: [BitcoinOutputResolver, BitcoinTransactionOutSpendsLoader],
})
export class BitcoinOutputModule {}
