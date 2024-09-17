import { Module } from '@nestjs/common';
import { BitcoinApiModule } from 'src/core/bitcoin-api/bitcoin-api.module';
import { BitcoinBlockResolver } from './block.resolver';
import { BitcoinBlockLoader } from './dataloader/block.dataloader';
import { BitcoinBlockTransactionsLoader } from './dataloader/block-transactions.dataloader';
import { BitcoinBlockTxidsLoader } from './dataloader/block-txids.dataloader';

@Module({
  imports: [BitcoinApiModule],
  providers: [
    BitcoinBlockResolver,
    BitcoinBlockLoader,
    BitcoinBlockTransactionsLoader,
    BitcoinBlockTxidsLoader,
  ],
  exports: [BitcoinBlockLoader, BitcoinBlockTransactionsLoader, BitcoinBlockTxidsLoader],
})
export class BitcoinBlockModule {}
