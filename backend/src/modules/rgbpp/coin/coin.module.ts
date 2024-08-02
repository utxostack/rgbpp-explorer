import { Module } from '@nestjs/common';
import { CkbExplorerModule } from 'src/core/ckb-explorer/ckb-explorer.module';
import { RgbppCoinResolver } from './coin.resolver';
import { CkbExplorerXUDTTransactionsLoader } from './coin.dataloader';

@Module({
  imports: [CkbExplorerModule],
  providers: [RgbppCoinResolver, CkbExplorerXUDTTransactionsLoader],
})
export class RgbppCoinModule {}
