import { Args, Float, Int, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Layer, RgbppHolder, RgbppStatistic } from './statistic.model';
import { RgbppStatisticService } from './statistic.service';
import { OrderType } from 'src/modules/api.model';
import { Holder, LeapDirection } from '@prisma/client';

@Resolver(() => RgbppStatistic)
export class RgbppStatisticResolver {
  constructor(private rgbppStatisticService: RgbppStatisticService) { }

  @Query(() => RgbppStatistic, { name: 'rgbppStatistic' })
  public async getRgbppStatistic(): Promise<RgbppStatistic> {
    return {};
  }

  @ResolveField(() => [RgbppHolder])
  public async holders(
    @Args('layer', { type: () => Layer }) layer: Layer,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('pageSize', { type: () => Int, nullable: true }) pageSize?: number,
    @Args('order', { type: () => OrderType, nullable: true }) order?: OrderType,
  ): Promise<Pick<Holder, 'address' | 'assetCount'>[]> {
    const holders = await this.rgbppStatisticService.getRgbppAssetsHolders({
      page: page ?? 1,
      pageSize: pageSize ?? 10,
      order: order ?? 'desc',
      isLayer1: layer === Layer.L1,
    });
    return holders;
  }

  @ResolveField(() => Float)
  public async holdersCount(@Args('layer', { type: () => Layer }) layer: Layer): Promise<number> {
    const count = await this.rgbppStatisticService.getRgbppAssetsHoldersCount(layer === Layer.L1);
    return count;
  }

  @ResolveField(() => Float, { nullable: true })
  public async latest24HoursL1TransactionsCount(
    @Args('leapDirection', { type: () => LeapDirection, nullable: true })
    leapDirection?: LeapDirection,
  ): Promise<number | null> {
    const transactions = await this.rgbppStatisticService.getLatest24L1Transactions(leapDirection);
    return transactions?.length ?? null;
  }

  @ResolveField(() => Float, { nullable: true })
  public async latest24HoursL2TransactionsCount(): Promise<number | null> {
    const transactions = await this.rgbppStatisticService.getLatest24L2Transactions();
    return transactions.length ?? null;
  }
}
