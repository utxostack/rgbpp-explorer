import { forwardRef, Module } from '@nestjs/common';
import { CkbExplorerModule } from 'src/core/ckb-explorer/ckb-explorer.module';
import { RgbppStatisticResolver } from './statistic.resolver';
import { RgbppStatisticService } from './statistic.service';
import { CkbRpcModule } from 'src/core/ckb-rpc/ckb-rpc.module';
import { BitcoinApiModule } from 'src/core/bitcoin-api/bitcoin-api.module';
import { RgbppModule } from '../rgbpp.module';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
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
export class RgbppStatisticModule {
  constructor(
    private rgbppStatisticService: RgbppStatisticService,
    private schedulerRegistry: SchedulerRegistry,
  ) {
    this.schedulerRegistry.addCronJob(
      'collectLatest24HourRgbppTransactions',
      new CronJob(CronExpression.EVERY_HOUR, () => {
        this.rgbppStatisticService.collectLatest24HourRgbppTransactions();
      }),
    );
  }
}
