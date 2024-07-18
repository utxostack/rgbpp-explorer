import { Module } from '@nestjs/common';
import { RgbppCoinResolver } from './coin.resolver';
import { CkbExplorerModule } from 'src/core/ckb-explorer/ckb-explorer.module';

@Module({
  imports: [CkbExplorerModule],
  providers: [RgbppCoinResolver],
})
export class CoinModule {}
