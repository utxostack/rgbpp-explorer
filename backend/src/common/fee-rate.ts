import { TransactionFeeRate } from 'src/core/ckb-explorer/ckb-explorer.interface';

// https://github.com/nervosnetwork/ckb-explorer-frontend/blob/78ef8fba86c01e772c6b7edd8ceb5fe96cbd8b9b/src/pages/FeeRateTracker/FeeRateTrackerComp.tsx#L30
export const getWeightedMedian = (tfrs: TransactionFeeRate[]): number => {
  if (tfrs?.length === 0) {
    return 0;
  }
  return tfrs.length % 2 === 0
    ? (tfrs[tfrs.length / 2 - 1].confirmation_time + tfrs[tfrs.length / 2 - 1].confirmation_time) /
    2
    : tfrs[(tfrs.length - 1) / 2].confirmation_time;
};

// https://github.com/nervosnetwork/ckb-explorer-frontend/blob/78ef8fba86c01e772c6b7edd8ceb5fe96cbd8b9b/src/pages/FeeRateTracker/FeeRateTrackerComp.tsx#L39
export const calcFeeRate = (tfrs: TransactionFeeRate[]): number =>
  tfrs.length === 0
    ? 0
    : Math.round(tfrs.reduce((acc, cur) => acc + cur.fee_rate * 1000, 0) / tfrs.length);
