import DataLoader from 'dataloader';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbTransaction, CkbBaseTransaction } from './transaction.model';
import { CkbBlockLoader, CkbBlockLoaderResponse } from '../block/block.dataloader';
import { Loader } from '@applifting-io/nestjs-dataloader';
import { BaseCkbBlock, CkbBlock } from '../block/block.model';

@Resolver(() => CkbTransaction)
export class CkbTransactionResolver {
  @ResolveField(() => CkbBlock)
  public async block(
    @Parent() transaction: CkbBaseTransaction,
    @Loader(CkbBlockLoader)
    blockLoader: DataLoader<string, CkbBlockLoaderResponse>,
  ): Promise<BaseCkbBlock> {
    const block = await blockLoader.load(transaction.blockNumber.toString());
    return CkbBlock.fromCKBExplorer(block);
  }
}
