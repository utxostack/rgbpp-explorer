import { Module } from '@nestjs/common';
import { RgbppCoinModule } from './coin/coin.module';
import { RgbppStatisticModule } from './statistic/statistic.module';
import { RgbppTransactionModule } from './transaction/transaction.module';
import { RgbppAddressModule } from './address/address.module';
import { CkbExplorerModule } from 'src/core/ckb-explorer/ckb-explorer.module';
import { CkbRpcModule } from 'src/core/ckb-rpc/ckb-rpc.module';
import { RgbppService } from './rgbpp.service';

@Module({
  imports: [
    CkbExplorerModule,
    CkbRpcModule,
    RgbppAddressModule,
    RgbppTransactionModule,
    RgbppCoinModule,
    RgbppStatisticModule,
  ],
  providers: [RgbppService],
  exports: [RgbppService]
})
export class RgbppModule {}
