import DataLoader from 'dataloader';
import { BI } from '@ckb-lumos/bi';
import { Loader } from '@applifting-io/nestjs-dataloader';
import { Args, Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbTransaction, CkbBaseTransaction } from './transaction.model';
import { CkbTransactionLoader, CkbTransactionLoaderResponse } from './transaction.dataloader';
import { CkbBlockLoader, CkbBlockLoaderResponse } from '../block/block.dataloader';
import { CkbBaseBlock, CkbBlock } from '../block/block.model';
import { CkbBaseCell, CkbCell } from '../cell/cell.model';

@Resolver(() => CkbTransaction)
export class CkbTransactionResolver {
  @Query(() => CkbTransaction, { name: 'ckbTransaction', nullable: true })
  public async getTransaction(
    @Args('txHash') txHash: string,
    @Loader(CkbTransactionLoader)
    transactionLoader: DataLoader<string, CkbTransactionLoaderResponse>,
  ): Promise<CkbBaseTransaction | null> {
    const transaction = await transactionLoader.load(txHash);
    if (!transaction) {
      return null;
    }
    return CkbTransaction.from(transaction);
  }

  @ResolveField(() => [CkbCell])
  public async inputs(
    @Parent() transaction: CkbBaseTransaction,
    @Loader(CkbTransactionLoader)
    transactionLoader: DataLoader<string, CkbTransactionLoaderResponse>,
  ): Promise<CkbBaseCell[]> {
    const tx = await transactionLoader.load(transaction.hash);
    const inputs = Promise.all(
      tx.transaction.inputs
        // Filter out cellbase transaction
        .filter((input) => !input.previous_output.tx_hash.endsWith('0'.repeat(64)))
        .map(async (_, i) => {
          const input = tx.transaction.inputs[i];
          const previousTx = await transactionLoader.load(input.previous_output.tx_hash);
          const index = BI.from(input.previous_output.index).toNumber();
          return CkbCell.from(previousTx.transaction, index);
        }),
    );
    return inputs;
  }

  @ResolveField(() => CkbBlock)
  public async block(
    @Parent() transaction: CkbBaseTransaction,
    @Loader(CkbBlockLoader)
    blockLoader: DataLoader<string, CkbBlockLoaderResponse>,
  ): Promise<CkbBaseBlock> {
    const block = await blockLoader.load(transaction.blockNumber.toString());
    return CkbBlock.from(block);
  }

  @ResolveField(() => Float)
  public async feeRate(@Parent() transaction: CkbBaseTransaction): Promise<number> {
    // TODO: implement this resolver
    return 0;
  }

  @ResolveField(() => Float)
  public async size(@Parent() transaction: CkbBaseTransaction): Promise<number> {
    // TODO: implement this resolver
    return 0;
  }

  @ResolveField(() => Float)
  public async confirmations(@Parent() transaction: CkbBaseTransaction): Promise<number> {
    // TODO: implement this resolver
    return 0;
  }
}
