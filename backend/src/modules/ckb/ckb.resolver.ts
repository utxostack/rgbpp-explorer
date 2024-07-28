import { toNumber } from 'lodash';
import { Float, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbRpcWebsocketService } from 'src/core/ckb-rpc/ckb-rpc-websocket.service';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import { CkbBaseChainInfo, CkbChainInfo, CkbFees } from './ckb.model';

@Resolver(() => CkbChainInfo)
export class CkbResolver {
  constructor(
    private ckbRpcService: CkbRpcWebsocketService,
    private ckbExplorerService: CkbExplorerService,
  ) {}

  @Query(() => CkbChainInfo, { name: 'ckbChainInfo' })
  public async chainInfo(): Promise<CkbBaseChainInfo> {
    const tipBlockNumber = await this.ckbRpcService.getTipBlockNumber();
    return {
      tipBlockNumber,
    };
  }

  @ResolveField(() => Float)
  public async txCountIn24Hours(): Promise<number> {
    const ckbStatsRes = await this.ckbExplorerService.getStatistics();
    return toNumber(ckbStatsRes.data.attributes.transactions_last_24hrs);
  }

  @ResolveField(() => CkbFees)
  public async fees(): Promise<CkbFees> {
    // TODO: implement this resolver
    // https://github.com/nervosnetwork/ckb-explorer-frontend/blob/develop/src/utils/chart.ts#L109-L157
    // https://github.com/nervosnetwork/ckb-explorer-frontend/blob/develop/src/pages/FeeRateTracker/FeeRateTrackerComp.tsx#L39-L67

    const ckbStatsRes = await this.ckbExplorerService.getStatistics();
    const ckbStats = ckbStatsRes.data.attributes;

    const feesStatsRes = await this.ckbExplorerService.getTransactionFeesStatistic();
    const feesStats = feesStatsRes.data.attributes;

    const txFees = feesStats.transaction_fee_rates;
    const txsPerMinute = ckbStats.transactions_count_per_minute;
    const averageBlockTime = ckbStats.average_block_time;
    return {
      fast: 0,
      slow: 0,
      average: 0,
    };
  }
}
