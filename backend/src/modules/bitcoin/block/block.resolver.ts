import DataLoader from 'dataloader';
import { Logger } from '@nestjs/common';
import { Loader } from '@applifting-io/nestjs-dataloader';
import { Args, Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { BitcoinBaseTransaction, BitcoinTransaction } from '../transaction/transaction.model';
import { BitcoinAddress, BitcoinBaseAddress } from '../address/address.model';
import { BitcoinBaseBlock, BitcoinBlock, FeeRateRange } from './block.model';
import {
  BitcoinBlockLoader,
  BitcoinBlockLoaderResponse,
  BitcoinBlockTransactionsLoader,
  BitcoinBlockTransactionsLoaderProps,
  BitcoinBlockTransactionsLoaderResponse,
} from './block.dataloader';

@Resolver(() => BitcoinBlock)
export class BitcoinBlockResolver {
  private logger = new Logger(BitcoinBlockResolver.name);

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
    @Loader(BitcoinBlockLoader) blockLoader: DataLoader<string, BitcoinBlockLoaderResponse>,
  ): Promise<BitcoinBaseAddress> {
    // XXX: only the "mempool" mode returns the "extra" field
    const detail = await blockLoader.load(block.id);
    if (detail.extras) {
      return {
        address: detail.extras.coinbaseAddress,
      };
    } else {
      this.logger.error('"miner" cannot be resolved in "electrs" mode');
      return null;
    }
  }

  @ResolveField(() => Float)
  public async reward(
    @Parent() block: BitcoinBaseBlock,
    @Loader(BitcoinBlockLoader) blockLoader: DataLoader<string, BitcoinBlockLoaderResponse>,
  ): Promise<number> {
    // XXX: only the "mempool" mode returns the "extra" field
    const detail = await blockLoader.load(block.id);
    if (detail.extras) {
      return detail.extras.reward;
    } else {
      this.logger.error('"reward" cannot be resolved in "electrs" mode');
      return 0;
    }
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
      this.logger.error('"totalFee" cannot be resolved in "electrs" mode');
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
      this.logger.error('"feeRateRange" cannot be resolved in "electrs" mode');
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
    blockTxsLoader: DataLoader<
      BitcoinBlockTransactionsLoaderProps,
      BitcoinBlockTransactionsLoaderResponse
    >,
    @Args('startIndex', {
      nullable: true,
      description: 'For pagination, must be a multiplication of 25',
    })
    startIndex?: number,
  ): Promise<BitcoinBaseTransaction[]> {
    const txs = await blockTxsLoader.load({
      hash: block.id,
      startIndex,
    });
    return txs.map((tx) => BitcoinTransaction.from(tx));
  }
}
