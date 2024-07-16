import DataLoader from 'dataloader';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Transaction, BaseTransaction } from './transaction.model';
import { Block, BaseBlock } from '../block/block.model';
import { Loader } from '@applifting-io/nestjs-dataloader';
import { BlockLoader } from '../block/block.dataloader';

@Resolver(() => Transaction)
export class TransactionResolver {
  @ResolveField(() => Block)
  public async block(
    @Parent() transaction: BaseTransaction,
    @Loader(BlockLoader)
    blockLoader: DataLoader<string, BaseBlock>,
  ): Promise<BaseBlock> {
    const block = await blockLoader.load(transaction.blockNumber.toString());
    return block;
  }
}
