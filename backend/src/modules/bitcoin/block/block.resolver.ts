import { Loader } from 'src/common/dataloader';
import { Args, Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { BitcoinTransaction } from '../transaction/transaction.model';
import { BitcoinAddress } from '../address/address.model';
import { BitcoinBlock, FeeRateRange } from './block.model';
import { BitcoinBlockLoader, BitcoinBlockLoaderType } from './dataloader/block.dataloader';
import {
  BitcoinBlockTransactionsLoader,
  BitcoinBlockTransactionsLoaderType,
} from './dataloader/block-transactions.dataloader';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import { ComplexityType } from 'src/modules/complexity.plugin';

@Resolver(() => BitcoinBlock)
export class BitcoinBlockResolver {
  constructor(private bitcoinApiService: BitcoinApiService) { }

  @Query(() => BitcoinBlock, {
    name: 'btcBlock',
    nullable: true,
    complexity: ComplexityType.RequestField,
  })
  public async getBlock(
    @Args('hashOrHeight', { type: () => String }) hashOrHeight: string,
    @Loader(BitcoinBlockLoader) blockLoader: BitcoinBlockLoaderType,
  ): Promise<BitcoinBlock | null> {
    const block = await blockLoader.load(hashOrHeight);
    if (!block) {
      return null;
    }
    return BitcoinBlock.from(block);
  }

  @ResolveField(() => BitcoinAddress, {
    nullable: true,
    complexity: ComplexityType.RequestField,
  })
  public async miner(
    @Parent() block: BitcoinBlock,
    @Loader(BitcoinBlockLoader) blockLoader: BitcoinBlockLoaderType,
  ): Promise<BitcoinAddress | null> {
    // XXX: only the "mempool" mode returns the "extra" field
    const detail = await blockLoader.load(block.id);
    if (!detail || !detail.extras?.coinbaseAddress) {
      return null;
    }
    return {
      address: detail.extras.coinbaseAddress,
    };
  }

  @ResolveField(() => Float, {
    nullable: true,
    complexity: ComplexityType.RequestField,
  })
  public async reward(
    @Parent() block: BitcoinBlock,
    @Loader(BitcoinBlockLoader) blockLoader: BitcoinBlockLoaderType,
  ): Promise<number | null> {
    // XXX: only the "mempool" mode returns the "extra" field
    const detail = await blockLoader.load(block.id);
    if (!detail || !detail.extras?.reward) {
      return null;
    }
    return detail.extras.reward;
  }

  @ResolveField(() => Float, { nullable: true, complexity: ComplexityType.RequestField })
  public async totalFee(
    @Parent() block: BitcoinBlock,
    @Loader(BitcoinBlockLoader) blockLoader: BitcoinBlockLoaderType,
  ): Promise<number | null> {
    // XXX: only the "mempool" mode returns the "extra" field
    const detail = await blockLoader.load(block.id);
    if (!detail || !detail.extras?.totalFees) {
      return null;
    }
    return detail.extras.totalFees;
  }

  @ResolveField(() => FeeRateRange, {
    nullable: true,
    complexity: ComplexityType.RequestField,
  })
  public async feeRateRange(
    @Parent() block: BitcoinBlock,
    @Loader(BitcoinBlockLoader) blockLoader: BitcoinBlockLoaderType,
  ): Promise<FeeRateRange | null> {
    // XXX: only the "mempool" mode returns the "extra" field
    const detail = await blockLoader.load(block.id);
    if (!detail || !detail.extras?.feeRange) {
      return null;
    }
    return {
      min: detail.extras.feeRange[0],
      max: detail.extras.feeRange[detail.extras.feeRange.length - 1],
    };
  }

  @ResolveField(() => [BitcoinTransaction], {
    nullable: true,
    complexity: ({ childComplexity }) => ComplexityType.ListField * childComplexity,
  })
  public async transactions(
    @Parent() block: BitcoinBlock,
    @Loader(BitcoinBlockTransactionsLoader) blockTxsLoader: BitcoinBlockTransactionsLoaderType,
    @Args('startIndex', {
      nullable: true,
      description: 'For pagination, must be a multiplication of 25',
    })
    startIndex?: number,
  ): Promise<BitcoinTransaction[] | null> {
    const txs = await blockTxsLoader.load({
      hash: block.id,
      startIndex,
    });
    if (!txs) {
      return null;
    }
    return txs.map((tx) => BitcoinTransaction.from(tx));
  }

  @ResolveField(() => Float, { nullable: true, complexity: ComplexityType.RequestField })
  public async confirmations(@Parent() block: BitcoinBlock): Promise<number | null> {
    const info = await this.bitcoinApiService.getBlockchainInfo();
    return info.blocks - block.height;
  }
}
