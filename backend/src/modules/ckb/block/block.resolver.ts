import { BI } from '@ckb-lumos/bi';
import { toNumber } from 'lodash';
import { Loader } from 'src/common/dataloader';
import { Args, Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbTransaction } from '../transaction/transaction.model';
import { CkbAddress } from '../address/address.model';
import { CkbBlock } from './block.model';
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
import { CkbRpcWebsocketService } from 'src/core/ckb-rpc/ckb-rpc-websocket.service';
import { ComplexityType } from 'src/modules/complexity.plugin';

@Resolver(() => CkbBlock)
export class CkbBlockResolver {
  constructor(private ckbRpcService: CkbRpcWebsocketService) { }

  @Query(() => CkbBlock, {
    name: 'ckbBlock',
    nullable: true,
    complexity: ComplexityType.RequestField,
  })
  public async getBlock(
    @Args('heightOrHash', { type: () => String }) heightOrHash: string,
    @Loader(CkbRpcBlockLoader) rpcBlockLoader: CkbRpcBlockLoaderType,
  ): Promise<CkbBlock | null> {
    const block = await rpcBlockLoader.load(heightOrHash);
    if (!block) {
      return null;
    }
    return CkbBlock.from(block);
  }

  @ResolveField(() => Float, { nullable: true, complexity: ComplexityType.RequestField })
  public async totalFee(
    @Parent() block: CkbBlock,
    @Loader(CkbBlockEconomicStateLoader) blockEconomicLoader: CkbBlockEconomicStateLoaderType,
  ): Promise<number | null> {
    const blockEconomicState = await blockEconomicLoader.load(block.hash);
    if (!blockEconomicState) {
      return null;
    }
    return BI.from(blockEconomicState.txs_fee).toNumber();
  }

  @ResolveField(() => CkbAddress, { nullable: true, complexity: ComplexityType.RequestField })
  public async miner(
    @Parent() block: CkbBlock,
    @Loader(CkbExplorerBlockLoader) explorerBlockLoader: CkbExplorerBlockLoaderType,
  ): Promise<CkbAddress | null> {
    const explorerBlock = await explorerBlockLoader.load(block.hash);
    if (!explorerBlock) {
      return null;
    }
    return CkbAddress.from(explorerBlock.miner_hash);
  }

  @ResolveField(() => Float, { nullable: true, complexity: ComplexityType.RequestField })
  public async reward(
    @Parent() block: CkbBlock,
    @Loader(CkbExplorerBlockLoader) explorerBlockLoader: CkbExplorerBlockLoaderType,
  ): Promise<number | null> {
    const explorerBlock = await explorerBlockLoader.load(block.hash);
    if (!explorerBlock) {
      return null;
    }
    return toNumber(explorerBlock.miner_reward);
  }

  @ResolveField(() => [CkbTransaction], {
    nullable: true,
    complexity: ({ childComplexity }) => ComplexityType.ListField + childComplexity,
  })
  public async transactions(
    @Parent() { hash }: CkbBlock,
    @Loader(CkbRpcBlockLoader) rpcBlockLoader: CkbRpcBlockLoaderType,
    @Loader(CkbRpcTransactionLoader) rpcTxLoader: CkbRpcTransactionLoaderType,
  ): Promise<(CkbTransaction | null)[] | null> {
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

  @ResolveField(() => Float, { complexity: ComplexityType.RequestField })
  public async size(
    @Parent() block: CkbBlock,
    @Loader(CkbExplorerBlockLoader) explorerBlockLoader: CkbExplorerBlockLoaderType,
  ): Promise<number | null> {
    const explorerBlock = await explorerBlockLoader.load(block.hash);
    if (!explorerBlock) {
      return null;
    }
    return explorerBlock.size;
  }

  @ResolveField(() => Float, { complexity: ComplexityType.RequestField })
  public async confirmations(
    @Parent() block: CkbBlock,
    @Loader(CkbExplorerBlockLoader) explorerBlockLoader: CkbExplorerBlockLoaderType,
  ): Promise<number | null> {
    const tipBlockNumber = await this.ckbRpcService.getTipBlockNumber();
    const explorerBlock = await explorerBlockLoader.load(block.hash);
    if (!explorerBlock) {
      return null;
    }
    return tipBlockNumber - toNumber(explorerBlock.number);
  }
}
