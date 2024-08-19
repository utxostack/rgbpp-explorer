import { Args, Float, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { RgbppStatistic } from './statistic.model';
import { RgbppStatisticService } from './statistic.service';
import { LeapDirection } from '../transaction/transaction.model';

@Resolver(() => RgbppStatistic)
export class RgbppStatisticResolver {
  constructor(private rgbppStatisticService: RgbppStatisticService) { }

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
