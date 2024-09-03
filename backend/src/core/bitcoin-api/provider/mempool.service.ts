import mempoolJS from '@cell-studio/mempool.js';
import * as Sentry from '@sentry/node';
import { FeesMempoolBlocks } from '@cell-studio/mempool.js/lib/interfaces/bitcoin/fees';
import { Block, OutSpend, RecommendedFees, Transaction, UTXO } from '../bitcoin-api.schema';
import { IBitcoinDataProvider } from '../bitcoin-api.interface';
import * as https from 'node:https';

export class MempoolService implements IBitcoinDataProvider {
  private mempool: ReturnType<typeof mempoolJS>;
  private defaultFee = 1;

  constructor(
    private baseURL: string,
    network: string,
  ) {
    const url = new URL(baseURL);
    const httpsAgent = new https.Agent({ keepAlive: true });
    this.mempool = mempoolJS({
      hostname: url.hostname,
      network,
      config: {
        httpsAgent,
      },
    });
  }

  public async getBaseURL(): Promise<string> {
    return this.baseURL;
  }

  // https://github.com/mempool/mempool/blob/dbd4d152ce831859375753fb4ca32ac0e5b1aff8/backend/src/api/fee-api.ts#L77
  private roundUpToNearest(value: number, nearest: number): number {
    return Math.ceil(value / nearest) * nearest;
  }

  // https://github.com/mempool/mempool/blob/dbd4d152ce831859375753fb4ca32ac0e5b1aff8/backend/src/api/fee-api.ts#L65
  private optimizeMedianFee(
    pBlock: FeesMempoolBlocks,
    nextBlock: FeesMempoolBlocks | undefined,
    previousFee?: number,
  ): number {
    const useFee = previousFee ? (pBlock.medianFee + previousFee) / 2 : pBlock.medianFee;
    if (pBlock.blockVSize <= 500000) {
      return this.defaultFee;
    }
    if (pBlock.blockVSize <= 950000 && !nextBlock) {
      const multiplier = (pBlock.blockVSize - 500000) / 500000;
      return Math.max(Math.round(useFee * multiplier), this.defaultFee);
    }
    return this.roundUpToNearest(useFee, this.defaultFee);
  }

  // https://github.com/mempool/mempool/blob/dbd4d152ce831859375753fb4ca32ac0e5b1aff8/backend/src/api/fee-api.ts#L22
  private async calculateRecommendedFee(): Promise<RecommendedFees> {
    const pBlocks = await this.mempool.bitcoin.fees.getFeesMempoolBlocks();
    const minimumFee = this.defaultFee;
    const defaultMinFee = this.defaultFee;

    if (!pBlocks.length) {
      return {
        fastestFee: defaultMinFee,
        halfHourFee: defaultMinFee,
        hourFee: defaultMinFee,
        economyFee: minimumFee,
        minimumFee: minimumFee,
      };
    }

    const firstMedianFee = this.optimizeMedianFee(pBlocks[0], pBlocks[1]);
    const secondMedianFee = pBlocks[1]
      ? this.optimizeMedianFee(pBlocks[1], pBlocks[2], firstMedianFee)
      : this.defaultFee;
    const thirdMedianFee = pBlocks[2]
      ? this.optimizeMedianFee(pBlocks[2], pBlocks[3], secondMedianFee)
      : this.defaultFee;

    let fastestFee = Math.max(minimumFee, firstMedianFee);
    let halfHourFee = Math.max(minimumFee, secondMedianFee);
    let hourFee = Math.max(minimumFee, thirdMedianFee);
    const economyFee = Math.max(minimumFee, Math.min(2 * minimumFee, thirdMedianFee));

    fastestFee = Math.max(fastestFee, halfHourFee, hourFee, economyFee);
    halfHourFee = Math.max(halfHourFee, hourFee, economyFee);
    hourFee = Math.max(hourFee, economyFee);

    return {
      fastestFee: fastestFee,
      halfHourFee: halfHourFee,
      hourFee: hourFee,
      economyFee: economyFee,
      minimumFee: minimumFee,
    };
  }

  public async getFeesRecommended() {
    try {
      const response = await this.mempool.bitcoin.fees.getFeesRecommended();
      return RecommendedFees.parse(response);
    } catch (e) {
      Sentry.withScope((scope) => {
        scope.captureException(e);
      });
      const fees = await this.calculateRecommendedFee();
      return RecommendedFees.parse(fees);
    }
  }

  public async getAddress({ address }: { address: string }) {
    const response = await this.mempool.bitcoin.addresses.getAddress({ address });
    return response;
  }

  public async getAddressTxsUtxo({ address }: { address: string }) {
    const response = await this.mempool.bitcoin.addresses.getAddressTxsUtxo({ address });
    return response.map((utxo) => UTXO.parse(utxo));
  }

  public async getAddressTxs({ address, afterTxid }: { address: string; afterTxid?: string }) {
    const response = await this.mempool.bitcoin.addresses.getAddressTxs({
      address,
      after_txid: afterTxid,
    });
    return response.map((tx) => Transaction.parse(tx));
  }

  public async getTx({ txid }: { txid: string }) {
    const response = await this.mempool.bitcoin.transactions.getTx({ txid });
    return Transaction.parse(response);
  }

  public async getTxHex({ txid }: { txid: string }) {
    const response = await this.mempool.bitcoin.transactions.getTxHex({ txid });
    return response;
  }

  public async getTxOutSpend({ txid, vout }: { txid: string; vout: number }) {
    const response = await this.mempool.bitcoin.transactions.getTxOutspend({ txid, vout });
    return OutSpend.parse(response);
  }

  public async getTxOutSpends({ txid }: { txid: string }) {
    const response = await this.mempool.bitcoin.transactions.getTxOutspends({ txid });
    return response.map((outSpend) => OutSpend.parse(outSpend));
  }

  public async getTransactionTimes({ txids }: { txids: string[] }) {
    const response = await this.mempool.bitcoin.transactions.getTransactionTimes({ txId: txids });
    return response;
  }

  public async getBlock({ hash }: { hash: string }) {
    const response = await this.mempool.bitcoin.blocks.getBlock({ hash });
    return Block.parse(response);
  }

  public async getBlockTxs({ hash, startIndex }: { hash: string; startIndex?: number }) {
    const response = await this.mempool.bitcoin.blocks.getBlockTxs({
      hash,
      start_index: startIndex,
    });
    // XXX: This is a workaround to fix the type issue, need to fix the type in the mempool.js
    return (response as unknown as Transaction[]).map((tx) => Transaction.parse(tx));
  }

  public async getBlockHeight({ height }: { height: number }) {
    const response = await this.mempool.bitcoin.blocks.getBlockHeight({ height });
    return response;
  }

  public async getBlockHeader({ hash }: { hash: string }) {
    const response = await this.mempool.bitcoin.blocks.getBlockHeader({ hash });
    return response;
  }

  public async getBlockTxids({ hash }: { hash: string }) {
    const response = await this.mempool.bitcoin.blocks.getBlockTxids({ hash });
    return response;
  }

  public async getBlocksTipHash() {
    const response = await this.mempool.bitcoin.blocks.getBlocksTipHash();
    return response;
  }
}
