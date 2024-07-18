import { Module } from '@nestjs/common';
import { BitcoinTransactionModule } from './transaction/transaction.module';
import { BitcoinResolver } from './bitcoin.resolver';
import { BitcoinApiModule } from 'src/core/bitcoin-api/bitcoin-api.module';
import { BlockModule } from './block/block.module';
import { AddressModule } from './address/address.module';
import { InputModule } from './input/input.module';
import { OutputModule } from './output/output.module';

@Module({
  imports: [BitcoinApiModule, BlockModule, BitcoinTransactionModule, AddressModule, InputModule, OutputModule],
  providers: [BitcoinResolver],
})
export class BitcoinModule {}
