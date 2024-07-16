import { Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Block, BlockWithoutResolveFields } from './block.model';
import { BlockService } from './block.service';
import { Transaction } from '../transaction/transaction.model';

@Resolver(() => Block)
export class BlockResolver {
  constructor(private blockService: BlockService) { }

  @Query(() => [Block])
  public async latestBlocks(): Promise<BlockWithoutResolveFields[]> {
    const blocks = await this.blockService.getLatestBlocks();
    return blocks;
  }

  @Query(() => Block)
  public async block(heightOrHash: string): Promise<BlockWithoutResolveFields> {
    const block = await this.blockService.getBlock(heightOrHash);
    return block;
  }

  @ResolveField(() => Float)
  public async minFee(@Parent() block: Block): Promise<number> {
    const transactions = await this.blockService.getBlockTransactions(block.hash);
    const nonCellbaseTransactions = transactions.filter((tx) => !tx.isCellbase);
    if (nonCellbaseTransactions.length === 0) {
      return 0;
    }
    return Math.min(...nonCellbaseTransactions.map((tx) => tx.fee));
  }

  @ResolveField(() => Float)
  public async maxFee(@Parent() block: Block): Promise<number> {
    const transactions = await this.blockService.getBlockTransactions(block.hash);
    const nonCellbaseTransactions = transactions.filter((tx) => !tx.isCellbase);
    if (nonCellbaseTransactions.length === 0) {
      return 0;
    }
    return Math.max(...nonCellbaseTransactions.map((tx) => tx.fee), 0);
  }

  @ResolveField(() => [String])
  public async transactions(@Parent() block: Block): Promise<Transaction[]> {
    const transactions = await this.blockService.getBlockTransactions(block.hash);
    return transactions;
  }
}
