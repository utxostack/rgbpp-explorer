import { Module } from '@nestjs/common';
import { BitcoinApiModule } from 'src/core/bitcoin-api/bitcoin-api.module';
import { BitcoinAddressResolver } from './address.resolver';
import {
  BitcoinAddressLoader,
  BitcoinAddressBalanceLoader,
  BitcoinAddressTransactionsLoader,
} from './address.dataloader';

@Module({
  imports: [BitcoinApiModule],
  providers: [
    BitcoinAddressResolver,
    BitcoinAddressLoader,
    BitcoinAddressBalanceLoader,
    BitcoinAddressTransactionsLoader,
  ],
})
export class AddressModule {}
