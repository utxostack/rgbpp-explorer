import { Args, Float, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { RgbppHolder, RgbppStatistic } from './statistic.model';
import { RgbppStatisticService } from './statistic.service';
import { LeapDirection } from '../transaction/transaction.model';
import { OrderType } from 'src/modules/api.model';
import { Holder } from '@prisma/client';

@Resolver(() => RgbppStatistic)
export class RgbppStatisticResolver {
  constructor(private rgbppStatisticService: RgbppStatisticService) { }

  @Query(() => RgbppStatistic, { name: 'rgbppStatistic' })
  public async getRgbppStatistic(): Promise<RgbppStatistic> {
    return {};
  }

  @ResolveField(() => [RgbppHolder])
  public async holders(
    @Args('isLayer1', { type: () => Boolean }) isLayer1: boolean,
    @Args('order', { type: () => OrderType, nullable: true }) order?: OrderType,
    @Args('limit', { type: () => Float, nullable: true }) limit?: number,
  ): Promise<Pick<Holder, 'address' | 'assetCount'>[]> {
    const holders = await this.rgbppStatisticService.getRgbppAssetsHolders(isLayer1, order, limit);
    return holders;
  }

  @ResolveField(() => Float)
  public async holdersCount(
    @Args('isLayer1', { type: () => Boolean }) isLayer1: boolean,
  ): Promise<number> {
    const holders = await this.rgbppStatisticService.getRgbppAssetsHolders(isLayer1);
    return holders.length;
  }

  @ResolveField(() => Float, { nullable: true })
  public async latest24HoursL1TransactionsCount(
    @Args('leapDirection', { type: () => LeapDirection, nullable: true })
    leapDirection?: LeapDirection,
  ): Promise<number | null> {
    const txids = await this.rgbppStatisticService.getLatest24L1Transactions();
    if (txids && leapDirection) {
      const filteredTxhashs = await Promise.all(
        txids.map(async (txid) => {
          const direction = await this.rgbppStatisticService.getLeapDirectionByBtcTxid(txid);
          return direction === leapDirection ? txid : null;
        }),
      );
      return filteredTxhashs.filter((txhash) => txhash !== null).length;
    }
    return txids?.length ?? null;
  }

  @ResolveField(() => Float, { nullable: true })
  public async latest24HoursL2TransactionsCount(): Promise<number | null> {
    const txhashs = await this.rgbppStatisticService.getLatest24L2Transactions();
    return txhashs?.length ?? null;
  }
}
