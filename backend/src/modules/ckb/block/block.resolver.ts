import DataLoader from 'dataloader';
import { Args, Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbBlock, BaseCkbBlock } from './block.model';
import { CkbBaseTransaction, CkbTransaction } from '../transaction/transaction.model';
import {
  CkbBlockLoader,
  CkbBlockLoaderResponse,
  CkbBlockTransactionsLoader,
  CkbBlockTransactionsLoaderResponse,
} from './block.dataloader';
import { Loader } from '@applifting-io/nestjs-dataloader';

@Resolver(() => CkbBlock)
export class CkbBlockResolver {
  @Query(() => CkbBlock)
  public async block(
    @Args('heightOrHash', { type: () => String }) heightOrHash: string,
    @Loader(CkbBlockLoader) blockLoader: DataLoader<string, CkbBlockLoaderResponse>,
  ): Promise<BaseCkbBlock> {
    const block = await blockLoader.load(heightOrHash);
    return CkbBlock.fromCKBExplorer(block);
  }

  @ResolveField(() => Float)
  public async minFee(
    @Parent() block: CkbBlock,
    @Loader(CkbBlockTransactionsLoader)
    blockTransactionsLoader: DataLoader<string, CkbBlockTransactionsLoaderResponse>,
  ): Promise<number> {
    const transactions = await blockTransactionsLoader.load(block.hash);
    const nonCellbaseTransactions = transactions
      .map((tx) => CkbTransaction.fromCKBExplorer(tx))
      .filter((tx) => !tx.isCellbase);
    if (nonCellbaseTransactions.length === 0) {
      return 0;
    }
    return Math.min(...nonCellbaseTransactions.map((tx) => tx.fee));
  }

  @ResolveField(() => Float)
  public async maxFee(
    @Parent() block: CkbBlock,
    @Loader(CkbBlockTransactionsLoader)
    blockTransactionsLoader: DataLoader<string, CkbBlockTransactionsLoaderResponse>,
  ): Promise<number> {
    const transactions = await blockTransactionsLoader.load(block.hash);
    const nonCellbaseTransactions = transactions
      .map((tx) => CkbTransaction.fromCKBExplorer(tx))
      .filter((tx) => !tx.isCellbase);
    if (nonCellbaseTransactions.length === 0) {
      return 0;
    }
    return Math.max(...nonCellbaseTransactions.map((tx) => tx.fee), 0);
  }

  @ResolveField(() => [String])
  public async transactions(
    @Parent() block: CkbBlock,
    @Loader(CkbBlockTransactionsLoader)
    blockTransactionsLoader: DataLoader<string, CkbBlockTransactionsLoaderResponse>,
  ): Promise<CkbBaseTransaction[]> {
    const transactions = await blockTransactionsLoader.load(block.hash);
    return transactions.map((tx) => CkbTransaction.fromCKBExplorer(tx));
  }
}
