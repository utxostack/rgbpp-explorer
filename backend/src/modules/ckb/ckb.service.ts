import { Injectable } from '@nestjs/common';
import { TransactionFeeRate } from 'src/core/ckb-explorer/ckb-explorer.interface';

@Injectable()
export class CkbService {
  // https://github.com/nervosnetwork/ckb-explorer-frontend/blob/78ef8fba86c01e772c6b7edd8ceb5fe96cbd8b9b/src/utils/chart.ts#L109
  public getFeeRateSamples(feeRates: TransactionFeeRate[], TPM: number, avgBlockTime = 12) {
    if (feeRates.length === 0) return feeRates;

    const SAMPLES_MIN_COUNT = 100;

    const sampleCount = Math.max(SAMPLES_MIN_COUNT, Number.isNaN(TPM) ? 0 : Math.floor(TPM) * 10);
    const validSamples = feeRates
      .filter((i) => i.confirmation_time)
      .sort((a, b) => a.fee_rate - b.fee_rate);

    // check if lowest fee rate has ideal confirmation time
    const lowests = validSamples.slice(0, SAMPLES_MIN_COUNT);
    const avgOfLowests =
      lowests.reduce((acc, cur) => acc + cur.confirmation_time, 0) / validSamples.length;

    const ACCEPTABLE_CONFIRMATION_TIME = 2 * avgBlockTime;

    if (avgOfLowests <= ACCEPTABLE_CONFIRMATION_TIME) {
      return lowests;
    }

    // if lowest fee rate doesn't hit acceptable confirmation time, sample by iqrs

    // Calculate the first and third quartiles (Q1 and Q3)
    const q1Index = Math.floor(validSamples.length * 0.25);
    const q3Index = Math.floor(validSamples.length * 0.75);
    const q1 = validSamples[q1Index].fee_rate;
    const q3 = validSamples[q3Index].fee_rate;

    // Calculate the Interquartile Range (IQR)
    const iqr = q3 - q1;
    // // Define the lower and upper bounds for outliers
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    // Filter out the outliers
    const filteredData = validSamples.filter(
      (item) => item.fee_rate >= lowerBound && item.fee_rate <= upperBound,
    );

    const samples = filteredData
      .sort((a, b) => a.confirmation_time - b.confirmation_time)
      .reduce<TransactionFeeRate[]>((acc, cur) => {
        const last = acc[acc.length - 1];
        if (!last || last.fee_rate + 1.5 * iqr >= cur.fee_rate) {
          return [...acc, cur];
        }
        return acc;
      }, [])
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, sampleCount);

    return samples;
  }
}
