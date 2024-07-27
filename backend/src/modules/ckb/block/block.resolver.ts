import DataLoader from 'dataloader';
import { BI } from '@ckb-lumos/bi';
import { Loader } from '@applifting-io/nestjs-dataloader';
import { Args, Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbBaseTransaction, CkbTransaction } from '../transaction/transaction.model';
import { FeeRateRange } from '../../bitcoin/block/block.model';
import { CkbAddress } from '../address/address.model';
import { CkbBlock, CkbBaseBlock } from './block.model';
import {
  CkbBlockEconomicStateLoader,
  CkbBlockEconomicStateLoaderResponse,
  CkbBlockLoader,
  CkbBlockLoaderResponse,
} from './block.dataloader';
import {
  CkbRpcTransactionLoader,
  CkbRpcTransactionLoaderType,
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

  @ResolveField(() => FeeRateRange)
  public async feeRateRange(@Parent() block: CkbBlock): Promise<FeeRateRange> {
    // TODO: implement this resolver
    return {
      min: 0,
      max: 0,
    };
  }

  @ResolveField(() => CkbAddress)
  public async miner(@Parent() block: CkbBlock): Promise<CkbAddress> {
    // TODO: implement this resolver
    return null;
  }

  @ResolveField(() => [String])
  public async transactions(
    @Parent() { hash }: CkbBlock,
    @Loader(CkbBlockLoader) blockLoader: DataLoader<string, CkbBlockLoaderResponse>,
    @Loader(CkbRpcTransactionLoader) ckbRpcTxLoader: CkbRpcTransactionLoaderType,
  ): Promise<CkbBaseTransaction[]> {
    const block = await blockLoader.load(hash);
    return Promise.all(
      block.transactions.map(async (tx) => {
        const transaction = await ckbRpcTxLoader.load(tx.hash);
        return CkbTransaction.from(transaction);
      }),
    );
  }
}
