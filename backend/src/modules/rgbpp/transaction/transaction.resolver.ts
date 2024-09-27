import { Loader } from 'src/common/dataloader';
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
import { RgbppTransaction, RgbppLatestTransactionList } from './transaction.model';
import { RgbppTransactionLoader, RgbppTransactionLoaderType } from './transaction.dataloader';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import { BI } from '@ckb-lumos/bi';
import { LeapDirection } from '@prisma/client';
import { ComplexityType } from 'src/modules/complexity.plugin';
import { isDate } from 'lodash';

@Resolver(() => RgbppTransaction)
export class RgbppTransactionResolver {
  constructor(
    private rgbppTransactionService: RgbppTransactionService,
    private bitcoinApiService: BitcoinApiService,
  ) { }

  @Query(() => RgbppLatestTransactionList, {
    name: 'rgbppLatestTransactions',
    complexity: ({ args, childComplexity }) => (args.limit ?? 10) * childComplexity,
  })
  public async getRecentTransactions(
    @Args('limit', { type: () => Int, nullable: true }) limit: number = 10,
  ): Promise<RgbppLatestTransactionList> {
    const transactions = await this.rgbppTransactionService.getLatestTransactions(limit);

    return {
      txs: transactions,
      total: transactions.length,
      pageSize: 1,
    };
  }

  @Query(() => RgbppLatestTransactionList, {
    name: 'rgbppLatestL1Transactions',
    complexity: ({ args, childComplexity }) => (args.limit ?? 10) * childComplexity,
  })
  public async getLatestL1Transactions(
    @Args('limit', { type: () => Int, nullable: true }) limit: number = 10,
  ): Promise<RgbppLatestTransactionList> {
    const transactions = await this.rgbppTransactionService.getLatestL1Transactions(limit);
    return {
      txs: transactions,
      total: transactions.length,
      pageSize: 1,
    };
  }

  @Query(() => RgbppLatestTransactionList, {
    name: 'rgbppLatestL2Transactions',
    complexity: ({ args, childComplexity }) => (args.limit ?? 10) * childComplexity,
  })
  public async getLatestL2Transactions(
    @Args('limit', { type: () => Int, nullable: true }) limit: number = 10,
  ): Promise<RgbppLatestTransactionList> {
    const transactions = await this.rgbppTransactionService.getLatestL2Transactions(limit);
    return {
      txs: transactions,
      total: transactions.length,
      pageSize: 1,
    };
  }

  @Query(() => RgbppTransaction, {
    name: 'rgbppTransaction',
    nullable: true,
    complexity: ComplexityType.RequestField,
  })
  public async getTransaction(
    @Args('txidOrTxHash') txidOrTxHash: string,
    @Loader(RgbppTransactionLoader) txLoader: RgbppTransactionLoaderType,
  ): Promise<RgbppTransaction | null> {
    const tx = await txLoader.load(txidOrTxHash);
    return tx || null;
  }

  @ResolveField(() => Date, { complexity: ComplexityType.RequestField })
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
    return isDate(tx.blockTime) ? tx.blockTime : new Date(tx.blockTime);
  }

  @ResolveField(() => LeapDirection, { nullable: true, complexity: ComplexityType.RequestField })
  public async leapDirection(
    @Parent() tx: RgbppTransaction,
    @Loader(CkbRpcTransactionLoader) ckbRpcTxLoader: CkbRpcTransactionLoaderType,
  ): Promise<LeapDirection | null> {
    const ckbTx = await ckbRpcTxLoader.load(tx.ckbTxHash);
    if (!ckbTx) {
      return null;
    }
    return this.rgbppTransactionService.getLeapDirectionByCkbTx(ckbTx.transaction);
  }

  @ResolveField(() => CkbTransaction, { nullable: true, complexity: ComplexityType.RequestField })
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

  @ResolveField(() => BitcoinTransaction, {
    nullable: true,
    complexity: ComplexityType.RequestField,
  })
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
