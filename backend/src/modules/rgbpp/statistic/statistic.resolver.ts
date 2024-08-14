import { Float, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { RgbppStatistic } from './statistic.model';
import { RgbppStatisticService } from './statistic.service';

@Resolver(() => RgbppStatistic)
export class RgbppStatisticResolver {
  constructor(private rgbppStatisticService: RgbppStatisticService) {}

  @Query(() => RgbppStatistic, { name: 'rgbppStatistic' })
  public async getRgbppStatistic(): Promise<RgbppStatistic> {
    return {};
  }

  @ResolveField(() => Float)
  public async transactionsCount(): Promise<number> {
    // TODO: implement this
    return 0;
  }

  @ResolveField(() => Float)
  public async holdersCount(): Promise<number> {
    // TODO: implement this
    return 0;
  }

  @ResolveField(() => Float)
  public async latest24HoursL1TransactionsCount(): Promise<number> {
    const txids = await this.rgbppStatisticService.getLatest24L1Transactions();
    return txids.length;
  }

  @ResolveField(() => Float)
  public async latest24HoursL2TransactionsCount(): Promise<number> {
    const txhashs = await this.rgbppStatisticService.getLatest24L2Transactions();
    return txhashs.length;
  }
}
