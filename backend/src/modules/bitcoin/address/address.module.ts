import { Module } from '@nestjs/common';
import { BitcoinAddressResolver } from './address.resolver';

@Module({
  providers: [BitcoinAddressResolver],
})
export class AddressModule {}
