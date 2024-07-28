import { Module } from '@nestjs/common';
import { CkbExplorerModule } from 'src/core/ckb-explorer/ckb-explorer.module';
import { RgbppStatisticResolver } from './statistic.resolver';

@Module({
  imports: [CkbExplorerModule],
  providers: [RgbppStatisticResolver],
})
export class RgbppStatisticModule {}
