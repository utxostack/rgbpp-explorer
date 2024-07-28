import { Module } from '@nestjs/common';
import { BitcoinApiModule } from 'src/core/bitcoin-api/bitcoin-api.module';
import { CkbExplorerModule } from 'src/core/ckb-explorer/ckb-explorer.module';
import { BitcoinAddressResolver } from './address.resolver';
import { BitcoinAddressLoader, BitcoinAddressTransactionsLoader } from './address.dataloader';

@Module({
  imports: [BitcoinApiModule, CkbExplorerModule],
  providers: [BitcoinAddressResolver, BitcoinAddressLoader, BitcoinAddressTransactionsLoader],
  exports: [BitcoinAddressLoader, BitcoinAddressTransactionsLoader],
})
export class BitcoinAddressModule {}
