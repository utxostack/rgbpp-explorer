import DataLoader from 'dataloader';
import { Loader } from '@applifting-io/nestjs-dataloader';
import { Args, Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { BitcoinBaseTransaction, BitcoinTransaction } from '../transaction/transaction.model';
import { BitcoinAddress, BitcoinBaseAddress } from '../address/address.model';
import { BitcoinBaseBlock, BitcoinBlock, FeeRateRange } from './block.model';
import {
  BitcoinBlockLoader,
  BitcoinBlockLoaderResponse,
  BitcoinBlockTransactionsLoader,
  BitcoinBlockTransactionsLoaderResponse,
} from './block.dataloader';

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
  public async miner(
    @Parent() block: BitcoinBaseBlock,
    @Loader(BitcoinBlockTransactionsLoader)
    blockTxsLoader: DataLoader<string, BitcoinBlockTransactionsLoaderResponse>,
  ): Promise<BitcoinBaseAddress> {
    const txs = await blockTxsLoader.load(block.id);
    const coinbaseTx = BitcoinTransaction.from(txs[0]);
    return {
      address: coinbaseTx.vout[0].scriptpubkeyAddress,
    };
  }

  @ResolveField(() => Float)
  public async totalFee(
    @Parent() block: BitcoinBaseBlock,
    @Loader(BitcoinBlockLoader) blockLoader: DataLoader<string, BitcoinBlockLoaderResponse>,
  ): Promise<number> {
    // XXX: only the "mempool" mode returns the "extra" field
    const detail = await blockLoader.load(block.id);
    if (detail.extras) {
      return detail.extras.totalFees;
    } else {
      // TODO: what should be returned when using the "electrs" mode?
      return 0;
    }
  }

  @ResolveField(() => FeeRateRange)
  public async feeRateRange(
    @Parent() block: BitcoinBaseBlock,
    @Loader(BitcoinBlockLoader) blockLoader: DataLoader<string, BitcoinBlockLoaderResponse>,
  ): Promise<FeeRateRange> {
    // XXX: only the "mempool" mode returns the "extra" field
    const detail = await blockLoader.load(block.id);
    if (detail.extras) {
      return {
        min: detail.extras.feeRange[0],
        max: detail.extras.feeRange[detail.extras.feeRange.length - 1],
      };
    } else {
      // TODO: what should be returned when using the "electrs" mode?
      return {
        min: 0,
        max: 0,
      };
    }
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
