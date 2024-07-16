import DataLoader from 'dataloader';
import { Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Block, BaseBlock } from './block.model';
import { BlockService } from './block.service';
import { BaseTransaction } from '../transaction/transaction.model';
import { BlockLoader, BlockTransactionsLoader } from './block.dataloader';
import { Loader } from '@applifting-io/nestjs-dataloader';

@Resolver(() => Block)
export class BlockResolver {
  constructor(private blockService: BlockService) { }

  @Query(() => [Block])
  public async latestBlocks(
    @Loader(BlockLoader)
    blockLoader: DataLoader<string, BaseBlock>,
  ): Promise<BaseBlock[]> {
    const blockList = await this.blockService.getLatestBlockNumbers();
    const blocks = await Promise.all(blockList.map((block) => blockLoader.load(block)));
    return blocks;
  }

  @Query(() => Block)
  public async block(
    heightOrHash: string,
    @Loader(BlockLoader)
    blockLoader: DataLoader<string, BaseBlock>,
  ): Promise<BaseBlock> {
    const block = await blockLoader.load(heightOrHash);
    return block;
  }

  @ResolveField(() => Float)
  public async minFee(
    @Parent() block: Block,
    @Loader(BlockTransactionsLoader)
    blockTransactionsLoader: DataLoader<string, BaseTransaction[]>,
  ): Promise<number> {
    const transactions = await blockTransactionsLoader.load(block.hash);
    const nonCellbaseTransactions = transactions.filter((tx) => !tx.isCellbase);
    if (nonCellbaseTransactions.length === 0) {
      return 0;
    }
    return Math.min(...nonCellbaseTransactions.map((tx) => tx.fee));
  }

  @ResolveField(() => Float)
  public async maxFee(
    @Parent() block: Block,
    @Loader(BlockTransactionsLoader)
    blockTransactionsLoader: DataLoader<string, BaseTransaction[]>,
  ): Promise<number> {
    const transactions = await blockTransactionsLoader.load(block.hash);
    const nonCellbaseTransactions = transactions.filter((tx) => !tx.isCellbase);
    if (nonCellbaseTransactions.length === 0) {
      return 0;
    }
    return Math.max(...nonCellbaseTransactions.map((tx) => tx.fee), 0);
  }

  @ResolveField(() => [String])
  public async transactions(
    @Parent() block: Block,
    @Loader(BlockTransactionsLoader)
    blockTransactionsLoader: DataLoader<string, BaseTransaction[]>,
  ): Promise<BaseTransaction[]> {
    const transactions = await blockTransactionsLoader.load(block.hash);
    return transactions;
  }
}
