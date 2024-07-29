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
import {
  RgbppTransaction,
  RgbppBaseTransaction,
  RgbppLatestTransactionList,
  LeapDirectionMap,
  LeapDirection,
} from './transaction.model';
import { RgbppTransactionLoader, RgbppTransactionLoaderType } from './transaction.dataloader';

@Resolver(() => RgbppTransaction)
export class RgbppTransactionResolver {
  constructor(private transactionService: RgbppTransactionService) {}

  @Query(() => RgbppLatestTransactionList, { name: 'rgbppLatestTransactions' })
  public async getLatestTransactions(
    @Args('page', { type: () => Int, nullable: true }) page: number = 1,
    @Args('pageSize', { type: () => Int, nullable: true }) pageSize: number = 10,
  ): Promise<RgbppLatestTransactionList> {
    return await this.transactionService.getLatestTransactions(page, pageSize);
  }

  @Query(() => RgbppTransaction, { name: 'rgbppTransaction', nullable: true })
  public async getTransaction(
    @Args('txidOrTxHash') txidOrTxHash: string,
    @Loader(RgbppTransactionLoader) txLoader: RgbppTransactionLoaderType,
  ): Promise<RgbppBaseTransaction | null> {
    return await txLoader.load(txidOrTxHash);
  }

  @ResolveField(() => LeapDirection, { nullable: true })
  public async leapDirection(@Parent() tx: RgbppBaseTransaction): Promise<LeapDirection | null> {
    const digest = await this.transactionService.getRgbppDigest(tx.ckbTxHash);
    return digest?.leap_direction ? LeapDirectionMap[digest.leap_direction] : null;
  }

  @ResolveField(() => CkbTransaction, { nullable: true })
  public async ckbTransaction(
    @Parent() tx: RgbppBaseTransaction,
    @Loader(CkbRpcTransactionLoader) ckbRpcTxLoader: CkbRpcTransactionLoaderType,
  ) {
    const ckbTx = await ckbRpcTxLoader.load(tx.ckbTxHash);
    if (!ckbTx) {
      return null;
    }
    return CkbTransaction.from(ckbTx);
  }

  @ResolveField(() => BitcoinTransaction, { nullable: true })
  public async btcTransaction(
    @Parent() tx: RgbppBaseTransaction,
    @Loader(BitcoinTransactionLoader) txLoader: BitcoinTransactionLoaderType,
  ) {
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
