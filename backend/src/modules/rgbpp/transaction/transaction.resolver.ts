import { Loader } from '@applifting-io/nestjs-dataloader';
import { Args, Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbTransaction } from 'src/modules/ckb/transaction/transaction.model';
import {
  CkbRpcTransactionLoader,
  CkbRpcTransactionLoaderType,
} from 'src/modules/ckb/transaction/transaction.dataloader';
import { BitcoinTransaction } from 'src/modules/bitcoin/transaction/transaction.model';
import { RgbppTransactionService } from './transaction.service';
import {
  BitcoinTransactionLoader,
  BitcoinTransactionLoaderType,
} from 'src/modules/bitcoin/transaction/transaction.dataloader';
import { RgbppTransaction, RgbppLatestTransactionList, LeapDirection } from './transaction.model';
import { RgbppTransactionLoader, RgbppTransactionLoaderType } from './transaction.dataloader';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import { BI } from '@ckb-lumos/bi';

@Resolver(() => RgbppTransaction)
export class RgbppTransactionResolver {
  constructor(
    private rgbppTransactionService: RgbppTransactionService,
    private bitcoinApiService: BitcoinApiService,
  ) { }

  @Query(() => RgbppLatestTransactionList, { name: 'rgbppLatestTransactions' })
  public async getRecentTransactions(
    @Args('limit', { type: () => Int, nullable: true }) limit: number = 10,
  ): Promise<RgbppLatestTransactionList> {
    const { txs: l1Txs } = await this.rgbppTransactionService.getLatestTransactions(1, limit);
    const l2Txs = await this.rgbppTransactionService.getLatestL2Transactions(limit);
    const txs = [...l1Txs, ...l2Txs.txs].sort((a, b) => b.blockNumber - a.blockNumber);

    return {
      txs: txs.slice(0, limit),
      total: txs.length,
      pageSize: limit,
    };
  }

  @Query(() => RgbppLatestTransactionList, { name: 'rgbppLatestL1Transactions' })
  public async getLatestL1Transactions(
    @Args('page', { type: () => Int, nullable: true }) page: number = 1,
    @Args('pageSize', { type: () => Int, nullable: true }) pageSize: number = 10,
  ): Promise<RgbppLatestTransactionList> {
    const txs = await this.rgbppTransactionService.getLatestTransactions(page, pageSize);
    return txs;
  }

  @Query(() => RgbppLatestTransactionList, { name: 'rgbppLatestL2Transactions' })
  public async getLatestL2Transactions(
    @Args('limit', { type: () => Int, nullable: true }) limit: number = 10,
  ): Promise<RgbppLatestTransactionList> {
    return this.rgbppTransactionService.getLatestL2Transactions(limit);
  }

  @Query(() => RgbppTransaction, { name: 'rgbppTransaction', nullable: true })
  public async getTransaction(
    @Args('txidOrTxHash') txidOrTxHash: string,
    @Loader(RgbppTransactionLoader) txLoader: RgbppTransactionLoaderType,
  ): Promise<RgbppTransaction | null> {
    const tx = await txLoader.load(txidOrTxHash);
    return tx || null;
  }

  @ResolveField(() => Date)
  public async timestamp(
    @Parent() tx: RgbppTransaction,
    @Loader(BitcoinTransactionLoader) btcTxLoader: BitcoinTransactionLoaderType,
    @Loader(CkbRpcTransactionLoader) ckbTxLoader: CkbRpcTransactionLoaderType,
  ): Promise<Date | null> {
    const { btcTxid } = tx;
    if (btcTxid) {
      const [txTime] = await this.bitcoinApiService.getTransactionTimes({ txids: [btcTxid] });
      // get bitcoin transaction created time when pending
      if (txTime) {
        return new Date(txTime * 1000);
      }

      // get bitcoin transaction confirmed time when ckb transaction is pending
      if (!tx.blockTime) {
        const btcTx = await btcTxLoader.load(btcTxid);
        const btcBlockTime = btcTx!.status.block_time;
        if (btcBlockTime) {
          return new Date(btcBlockTime * 1000);
        }
      }
    }
    // get ckb transaction created time when pending
    if (!tx.blockTime) {
      const ckbTx = await ckbTxLoader.load(tx.ckbTxHash);
      return new Date(BI.from(ckbTx?.time_added_to_pool).toNumber());
    }
    return tx.blockTime;
  }

  @ResolveField(() => LeapDirection, { nullable: true })
  public async leapDirection(
    @Parent() tx: RgbppTransaction,
    @Loader(CkbRpcTransactionLoader) ckbRpcTxLoader: CkbRpcTransactionLoaderType,
  ): Promise<LeapDirection | null> {
    const ckbTx = await ckbRpcTxLoader.load(tx.ckbTxHash);
    if (!ckbTx) {
      return null;
    }
    return this.rgbppTransactionService.getLeapDirectionByCkbTx(ckbTx);
  }

  @ResolveField(() => CkbTransaction, { nullable: true })
  public async ckbTransaction(
    @Parent() tx: RgbppTransaction,
    @Loader(CkbRpcTransactionLoader) ckbRpcTxLoader: CkbRpcTransactionLoaderType,
  ): Promise<CkbTransaction | null> {
    const ckbTx = await ckbRpcTxLoader.load(tx.ckbTxHash);
    if (!ckbTx) {
      return null;
    }
    return CkbTransaction.from(ckbTx);
  }

  @ResolveField(() => BitcoinTransaction, { nullable: true })
  public async btcTransaction(
    @Parent() tx: RgbppTransaction,
    @Loader(BitcoinTransactionLoader) txLoader: BitcoinTransactionLoaderType,
  ): Promise<BitcoinTransaction | null> {
    if (!tx.btcTxid) {
      return null;
    }
    const btcTx = await txLoader.load(tx.btcTxid);
    if (!btcTx) {
      return null;
    }
    return BitcoinTransaction.from(btcTx);
  }
}
