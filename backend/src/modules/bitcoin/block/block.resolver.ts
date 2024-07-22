import { Args, Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { BitcoinBaseBlock, BitcoinBlock, FeeRateRange } from './block.model';
import {
  BitcoinBlockLoader,
  BitcoinBlockLoaderResponse,
  BitcoinBlockTransactionsLoader,
  BitcoinBlockTransactionsLoaderResponse,
} from './block.dataloader';
import { Loader } from '@applifting-io/nestjs-dataloader';
import DataLoader from 'dataloader';
import { BitcoinAddress, BitcoinBaseAddress } from '../address/address.model';
import { BitcoinBaseTransaction, BitcoinTransaction } from '../transaction/transaction.model';

@Resolver(() => BitcoinBlock)
export class BitcoinBlockResolver {
  @Query(() => BitcoinBlock, { name: 'btcBlock' })
  public async getBlock(
    @Args('hashOrHeight', { type: () => String }) hashOrHeight: string,
    @Loader(BitcoinBlockLoader) blockLoader: DataLoader<string, BitcoinBlockLoaderResponse>,
  ): Promise<BitcoinBaseBlock> {
    const block = await blockLoader.load(hashOrHeight);
    return BitcoinBlock.from(block);
  }

  @ResolveField(() => BitcoinAddress)
  public async miner(@Parent() block: BitcoinBaseBlock): Promise<BitcoinBaseAddress> {
    // TODO: Implement this resolver
    return {
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    };
  }

  @ResolveField(() => Float)
  public async totalFee(@Parent() block: BitcoinBaseBlock): Promise<number> {
    // TODO: Implement this resolver
    return 0;
  }

  @ResolveField(() => FeeRateRange)
  public async feeRateRange(@Parent() block: BitcoinBaseBlock): Promise<FeeRateRange> {
    // TODO: Implement this resolver
    return {
      min: 0,
      max: 1,
    };
  }

  @ResolveField(() => [BitcoinTransaction])
  public async transactions(
    @Parent() block: BitcoinBaseBlock,
    @Loader(BitcoinBlockTransactionsLoader)
    blockTxsLoader: DataLoader<string, BitcoinBlockTransactionsLoaderResponse>,
  ): Promise<BitcoinBaseTransaction[]> {
    const txs = await blockTxsLoader.load(block.id);
    return txs.map((tx) => BitcoinTransaction.from(tx));
  }
}
