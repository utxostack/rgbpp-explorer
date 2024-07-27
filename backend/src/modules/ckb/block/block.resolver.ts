import { BI } from '@ckb-lumos/bi';
import { toNumber } from 'lodash';
import { Loader } from '@applifting-io/nestjs-dataloader';
import { Args, Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbBaseTransaction, CkbTransaction } from '../transaction/transaction.model';
import { FeeRateRange } from '../../bitcoin/block/block.model';
import { CkbAddress, CkbBaseAddress } from '../address/address.model';
import { CkbBlock, CkbBaseBlock } from './block.model';
import {
  CkbBlockEconomicStateLoader,
  CkbBlockEconomicStateLoaderType,
  CkbExplorerBlockLoader,
  CkbExplorerBlockLoaderType,
  CkbRpcBlockLoader,
  CkbRpcBlockLoaderType,
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
    @Loader(CkbRpcBlockLoader) rpcBlockLoader: CkbRpcBlockLoaderType,
  ): Promise<CkbBaseBlock> {
    const block = await rpcBlockLoader.load(heightOrHash);
    return CkbBlock.from(block);
  }

  @ResolveField(() => Float)
  public async totalFee(
    @Parent() block: CkbBlock,
    @Loader(CkbBlockEconomicStateLoader) blockEconomicLoader: CkbBlockEconomicStateLoaderType,
  ): Promise<number> {
    const blockEconomicState = await blockEconomicLoader.load(block.hash);
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
  public async miner(
    @Parent() block: CkbBlock,
    @Loader(CkbExplorerBlockLoader) explorerBlockLoader: CkbExplorerBlockLoaderType,
  ): Promise<CkbBaseAddress> {
    const explorerBlock = await explorerBlockLoader.load(block.hash);
    return CkbAddress.from(explorerBlock.miner_hash);
  }

  @ResolveField(() => Float)
  public async reward(
    @Parent() block: CkbBlock,
    @Loader(CkbExplorerBlockLoader) explorerBlockLoader: CkbExplorerBlockLoaderType,
  ): Promise<number> {
    const explorerBlock = await explorerBlockLoader.load(block.hash);
    return toNumber(explorerBlock.miner_reward);
  }

  @ResolveField(() => [String])
  public async transactions(
    @Parent() { hash }: CkbBlock,
    @Loader(CkbRpcBlockLoader) ckbBlockLoader: CkbRpcBlockLoaderType,
    @Loader(CkbRpcTransactionLoader) ckbRpcTxLoader: CkbRpcTransactionLoaderType,
  ): Promise<CkbBaseTransaction[]> {
    const block = await ckbBlockLoader.load(hash);
    return Promise.all(
      block.transactions.map(async (tx) => {
        const transaction = await ckbRpcTxLoader.load(tx.hash);
        return CkbTransaction.from(transaction);
      }),
    );
  }
}
