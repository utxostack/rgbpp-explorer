import { Module } from '@nestjs/common';
import { BitcoinApiModule } from 'src/core/bitcoin-api/bitcoin-api.module';
import { BitcoinAddressResolver } from './address.resolver';
import { BitcoinAddressLoader, BitcoinAddressTransactionsLoader } from './address.dataloader';

@Module({
  imports: [BitcoinApiModule],
  providers: [BitcoinAddressResolver, BitcoinAddressLoader, BitcoinAddressTransactionsLoader],
  exports: [BitcoinAddressLoader, BitcoinAddressTransactionsLoader],
})
export class BitcoinAddressModule {}
