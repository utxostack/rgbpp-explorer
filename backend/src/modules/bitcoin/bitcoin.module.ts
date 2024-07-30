import { Module } from '@nestjs/common';
import { BitcoinApiModule } from 'src/core/bitcoin-api/bitcoin-api.module';
import { BitcoinTransactionModule } from './transaction/transaction.module';
import { BitcoinResolver } from './bitcoin.resolver';
import { BitcoinBlockModule } from './block/block.module';
import { BitcoinAddressModule } from './address/address.module';
import { BitcoinInputModule } from './input/input.module';
import { BitcoinOutputModule } from './output/output.module';

@Module({
  imports: [
    BitcoinApiModule,
    BitcoinBlockModule,
    BitcoinTransactionModule,
    BitcoinAddressModule,
    BitcoinInputModule,
    BitcoinOutputModule,
  ],
  providers: [BitcoinResolver],
})
export class BitcoinModule { }
