import { Float, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import { RgbppStatistic } from './statistic.model';
import { RgbppStatisticService } from './statistic.service';

@Resolver(() => RgbppStatistic)
export class RgbppStatisticResolver {
  constructor(
    private ckbExplorerService: CkbExplorerService,
    private rgbppStatisticService: RgbppStatisticService,
  ) {}

  @Query(() => RgbppStatistic, { name: 'rgbppStatistic' })
  public async getRgbppStatistic(): Promise<RgbppStatistic> {
    return {};
  }

  @ResolveField(() => Float)
  public async transactionsCount(): Promise<number> {
    const rgbppTxs = await this.ckbExplorerService.getRgbppTransactions();
    return rgbppTxs.meta.total;
  }

  @ResolveField(() => Float)
  public async holdersCount(): Promise<number> {
    const holders = await this.rgbppStatisticService.getRgbppAssetsHolders();
    return holders.length;
  }
}
