import { Module } from '@nestjs/common';
import { BitcoinBlockResolver } from './block.resolver';
import { BitcoinBlockLoader, BitcoinBlockTransactionsLoader } from './block.dataloader';
import { BitcoinApiModule } from 'src/core/bitcoin-api/bitcoin-api.module';

@Module({
  imports: [BitcoinApiModule],
  providers: [BitcoinBlockResolver, BitcoinBlockLoader, BitcoinBlockTransactionsLoader],
})
export class BlockModule {}
