import { forwardRef, Logger, Module } from '@nestjs/common';
import { CkbExplorerModule } from 'src/core/ckb-explorer/ckb-explorer.module';
import { RgbppStatisticResolver } from './statistic.resolver';
import { RgbppStatisticService } from './statistic.service';
import { CkbRpcModule } from 'src/core/ckb-rpc/ckb-rpc.module';
import { BitcoinApiModule } from 'src/core/bitcoin-api/bitcoin-api.module';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RgbppModule } from '../rgbpp.module';

@Module({
  imports: [CkbExplorerModule, CkbRpcModule, BitcoinApiModule, forwardRef(() => RgbppModule)],
  providers: [RgbppStatisticResolver, RgbppStatisticService],
  exports: [RgbppStatisticService],
})
export class RgbppStatisticModule {
  private readonly logger = new Logger(RgbppStatisticModule.name);

  constructor(private rgbppStatisticService: RgbppStatisticService) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  public async collectRgbppAssetsHoldersCronTask() {
    this.logger.log('Collecting RGBPP assets holders...');
    const holders = await this.rgbppStatisticService.collectRgbppAssetsHolders();
    await this.rgbppStatisticService.setRgbppAssetsHolders(holders);
  }
}
