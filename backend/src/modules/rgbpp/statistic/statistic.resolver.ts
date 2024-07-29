import { Float, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import { RgbppBaseStatistic, RgbppStatistic } from './statistic.model';

@Resolver(() => RgbppStatistic)
export class RgbppStatisticResolver {
  constructor(private ckbExplorerService: CkbExplorerService) {}

  @Query(() => RgbppStatistic, { name: 'rgbppStatistic' })
  public async getRgbppStatistic(): Promise<RgbppBaseStatistic> {
    return {};
  }

  @ResolveField(() => Float)
  public async transactionsCount(): Promise<number> {
    const rgbppTxs = await this.ckbExplorerService.getRgbppTransactions();
    return rgbppTxs.meta.total;
  }

  @ResolveField(() => Float)
  public async holdersCount(): Promise<number> {
    // TODO: implement this resolver
    return 0;
  }
}
