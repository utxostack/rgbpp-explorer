import { Module } from '@nestjs/common';
import { BitcoinApiModule } from 'src/core/bitcoin-api/bitcoin-api.module';
import { BitcoinBlockLoader, BitcoinBlockTransactionsLoader } from './block.dataloader';
import { BitcoinBlockResolver } from './block.resolver';

@Module({
  imports: [BitcoinApiModule],
  providers: [BitcoinBlockResolver, BitcoinBlockLoader, BitcoinBlockTransactionsLoader],
  exports: [BitcoinBlockLoader, BitcoinBlockTransactionsLoader],
})
export class BitcoinBlockModule {}
