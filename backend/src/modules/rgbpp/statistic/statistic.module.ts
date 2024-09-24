import { forwardRef, Module } from '@nestjs/common';
import { CkbExplorerModule } from 'src/core/ckb-explorer/ckb-explorer.module';
import { RgbppStatisticResolver } from './statistic.resolver';
import { RgbppStatisticService } from './statistic.service';
import { CkbRpcModule } from 'src/core/ckb-rpc/ckb-rpc.module';
import { BitcoinApiModule } from 'src/core/bitcoin-api/bitcoin-api.module';
import { RgbppModule } from '../rgbpp.module';
import { CkbScriptModule } from 'src/modules/ckb/script/script.module';
import { RgbppTransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [
    CkbRpcModule,
    CkbExplorerModule,
    CkbRpcModule,
    BitcoinApiModule,
    CkbScriptModule,
    RgbppTransactionModule,
    forwardRef(() => RgbppModule),
  ],
  providers: [RgbppStatisticResolver, RgbppStatisticService],
  exports: [RgbppStatisticService],
})
export class RgbppStatisticModule {}
