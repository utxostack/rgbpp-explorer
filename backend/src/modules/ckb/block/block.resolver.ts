import DataLoader from 'dataloader';
import { Args, Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbBlock, CkbBaseBlock } from './block.model';
import { CkbBaseTransaction, CkbTransaction } from '../transaction/transaction.model';
import {
  CkbBlockEconomicStateLoader,
  CkbBlockEconomicStateLoaderResponse,
  CkbBlockLoader,
  CkbBlockLoaderResponse,
} from './block.dataloader';
import { Loader } from '@applifting-io/nestjs-dataloader';
import { BI } from '@ckb-lumos/bi';
import {
  CkbTransactionLoader,
  CkbTransactionLoaderResponse,
} from '../transaction/transaction.dataloader';

@Resolver(() => CkbBlock)
export class CkbBlockResolver {
  @Query(() => CkbBlock, { name: 'ckbBlock' })
  public async getBlock(
    @Args('heightOrHash', { type: () => String }) heightOrHash: string,
    @Loader(CkbBlockLoader) blockLoader: DataLoader<string, CkbBlockLoaderResponse>,
  ): Promise<CkbBaseBlock> {
    const block = await blockLoader.load(heightOrHash);
    return CkbBlock.from(block);
  }

  @ResolveField(() => Float)
  public async totalFee(
    @Parent() block: CkbBlock,
    @Loader(CkbBlockEconomicStateLoader)
    blockTransactionsLoader: DataLoader<string, CkbBlockEconomicStateLoaderResponse>,
  ): Promise<number> {
    const blockEconomicState = await blockTransactionsLoader.load(block.hash);
    return BI.from(blockEconomicState.txs_fee).toNumber();
  }

  @ResolveField(() => [String])
  public async transactions(
    @Parent() { hash }: CkbBlock,
    @Loader(CkbBlockLoader) blockLoader: DataLoader<string, CkbBlockLoaderResponse>,
    @Loader(CkbTransactionLoader)
    transactionLoader: DataLoader<string, CkbTransactionLoaderResponse>,
  ): Promise<CkbBaseTransaction[]> {
    const block = await blockLoader.load(hash);
    const transactions = await Promise.all(
      block.transactions.map(async (tx) => {
        const transaction = await transactionLoader.load(tx.hash);
        return CkbTransaction.from(transaction);
      }),
    );
    return transactions;
  }
}
