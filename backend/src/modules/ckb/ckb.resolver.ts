import { toNumber } from 'lodash';
import { Float, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbRpcWebsocketService } from 'src/core/ckb-rpc/ckb-rpc-websocket.service';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import { CkbBaseChainInfo, CkbChainInfo, CkbFees } from './ckb.model';
import { CkbService } from './ckb.service';
import { calcFeeRate, getWeightedMedian } from 'src/common/fee-rate';

@Resolver(() => CkbChainInfo)
export class CkbResolver {
  constructor(
    private ckbService: CkbService,
    private ckbRpcService: CkbRpcWebsocketService,
    private ckbExplorerService: CkbExplorerService,
  ) { }

  @Query(() => CkbChainInfo, { name: 'ckbChainInfo' })
  public async chainInfo(): Promise<CkbBaseChainInfo> {
    const tipBlockNumber = await this.ckbRpcService.getTipBlockNumber();
    return {
      tipBlockNumber,
    };
  }

  @ResolveField(() => Float)
  public async transactionsCountIn24Hours(): Promise<number> {
    const ckbStatsRes = await this.ckbExplorerService.getStatistics();
    return toNumber(ckbStatsRes.data.attributes.transactions_last_24hrs);
  }

  @ResolveField(() => CkbFees)
  public async fees(): Promise<CkbFees> {
    const stats = await this.ckbExplorerService.getStatistics();
    const feesStats = await this.ckbExplorerService.getTransactionFeesStatistic();
    // https://github.com/nervosnetwork/ckb-explorer-frontend/blob/e5c1e75c270f9dbb5ffdf88888df80315dc3f4cd/src/pages/FeeRateTracker/index.tsx#L64
    const transactionFeeRates = this.ckbService.getFeeRateSamples(
      feesStats.transaction_fee_rates,
      toNumber(stats.data.attributes.transactions_count_per_minute),
      toNumber(stats.data.attributes.average_block_time) / 1000,
    );

    // https://github.com/nervosnetwork/ckb-explorer-frontend/blob/78ef8fba86c01e772c6b7edd8ceb5fe96cbd8b9b/src/pages/FeeRateTracker/FeeRateTrackerComp.tsx#L46
    const allFrs = transactionFeeRates.sort((a, b) => a.confirmation_time - b.confirmation_time);
    const avgConfirmationTime = getWeightedMedian(allFrs);
    const lowFrs = allFrs.filter((r) => r.confirmation_time >= avgConfirmationTime);
    const highFrs = allFrs.filter((r) => r.confirmation_time <= avgConfirmationTime);
    const [low, medium, high] = [lowFrs, allFrs, highFrs].map(calcFeeRate).sort((a, b) => a - b);

    return {
      fast: high,
      slow: low,
      average: medium,
    };
  }
}
