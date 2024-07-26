import { Module } from '@nestjs/common';
import { BitcoinApiModule } from 'src/core/bitcoin-api/bitcoin-api.module';
import { CkbAddressResolver } from './address.resolver';

@Module({
  imports: [BitcoinApiModule],
  providers: [CkbAddressResolver],
})
export class CkbAddressModule {}
