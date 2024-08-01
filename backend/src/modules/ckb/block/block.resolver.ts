import { BI } from '@ckb-lumos/bi';
import { toNumber } from 'lodash';
import { Loader } from '@applifting-io/nestjs-dataloader';
import { Args, Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbBaseTransaction, CkbTransaction } from '../transaction/transaction.model';
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
  @Query(() => CkbBlock, { name: 'ckbBlock', nullable: true })
  public async getBlock(
    @Args('heightOrHash', { type: () => String }) heightOrHash: string,
    @Loader(CkbRpcBlockLoader) rpcBlockLoader: CkbRpcBlockLoaderType,
  ): Promise<CkbBaseBlock | null> {
    const block = await rpcBlockLoader.load(heightOrHash);
    if (!block) {
      return null;
    }
    return CkbBlock.from(block);
  }

  @ResolveField(() => Float, { nullable: true })
  public async totalFee(
    @Parent() block: CkbBaseBlock,
    @Loader(CkbBlockEconomicStateLoader) blockEconomicLoader: CkbBlockEconomicStateLoaderType,
  ): Promise<number | null> {
    const blockEconomicState = await blockEconomicLoader.load(block.hash);
    if (!blockEconomicState) {
      return null;
    }
    return BI.from(blockEconomicState.txs_fee).toNumber();
  }

  @ResolveField(() => CkbAddress, { nullable: true })
  public async miner(
    @Parent() block: CkbBaseBlock,
    @Loader(CkbExplorerBlockLoader) explorerBlockLoader: CkbExplorerBlockLoaderType,
  ): Promise<CkbBaseAddress | null> {
    const explorerBlock = await explorerBlockLoader.load(block.hash);
    if (!explorerBlock) {
      return null;
    }
    return CkbAddress.from(explorerBlock.miner_hash);
  }

  @ResolveField(() => Float, { nullable: true })
  public async reward(
    @Parent() block: CkbBaseBlock,
    @Loader(CkbExplorerBlockLoader) explorerBlockLoader: CkbExplorerBlockLoaderType,
  ): Promise<number> {
    const explorerBlock = await explorerBlockLoader.load(block.hash);
    if (!explorerBlock) {
      return null;
    }
    return toNumber(explorerBlock.miner_reward);
  }

  @ResolveField(() => [String], { nullable: true })
  public async transactions(
    @Parent() { hash }: CkbBaseBlock,
    @Loader(CkbRpcBlockLoader) rpcBlockLoader: CkbRpcBlockLoaderType,
    @Loader(CkbRpcTransactionLoader) rpcTxLoader: CkbRpcTransactionLoaderType,
  ): Promise<(CkbBaseTransaction | null)[] | null> {
    const block = await rpcBlockLoader.load(hash);
    if (!block) {
      return null;
    }
    return Promise.all(
      block.transactions.map(async (tx) => {
        const transaction = await rpcTxLoader.load(tx.hash);
        if (!transaction) {
          return null;
        }
        return CkbTransaction.from(transaction);
      }),
    );
  }
}
