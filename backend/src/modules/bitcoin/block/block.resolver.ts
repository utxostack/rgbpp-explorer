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
    @Loader(BitcoinBlockTransactionsLoader)
    blockTxsLoader: DataLoader<string, BitcoinBlockTransactionsLoaderResponse>,
  ): Promise<number> {
    // TODO: The BitcoinApiService.getBlockTxs() only returns the first 25 transactions
    const txs = await blockTxsLoader.load(block.id);
    return txs.reduce((sum, tx) => sum + tx.fee, 0);
  }

  @ResolveField(() => FeeRateRange)
  public async feeRateRange(
    @Parent() block: BitcoinBaseBlock,
    @Loader(BitcoinBlockTransactionsLoader)
    blockTxsLoader: DataLoader<string, BitcoinBlockTransactionsLoaderResponse>,
  ): Promise<FeeRateRange> {
    // TODO: The BitcoinApiService.getBlockTxs() only returns the first 25 transactions
    const txs = await blockTxsLoader.load(block.id);

    let min = Infinity;
    let max = 0;
    for (const tx of txs.slice(1)) {
      const vSize = Math.ceil(tx.weight / 4);
      const feeRate = tx.fee / vSize;
      if (feeRate < min) {
        min = feeRate;
      }
      if (feeRate > max) {
        max = feeRate;
      }
    }
    return {
      min,
      max,
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
