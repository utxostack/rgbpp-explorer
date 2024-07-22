import { Module } from '@nestjs/common';
import { CkbExplorerModule } from 'src/core/ckb-explorer/ckb-explorer.module';
import { RgbppCoinResolver } from './coin.resolver';

@Module({
  imports: [CkbExplorerModule],
  providers: [RgbppCoinResolver],
})
export class CoinModule {}
