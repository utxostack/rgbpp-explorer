import { Module } from '@nestjs/common';
import { CkbExplorerModule } from 'src/core/ckb-explorer/ckb-explorer.module';
import { RgbppCoinResolver } from './coin.resolver';
import { CkbExplorerXUDTTransactionsLoader } from './coin.dataloader';
import { RgbppCoinService } from './coin.service';

@Module({
  imports: [CkbExplorerModule],
  providers: [RgbppCoinResolver, RgbppCoinService, CkbExplorerXUDTTransactionsLoader],
})
export class RgbppCoinModule { }
