import DataLoader from 'dataloader';
import { Float, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbTransaction, CkbBaseTransaction } from './transaction.model';
import { CkbBlockLoader, CkbBlockLoaderResponse } from '../block/block.dataloader';
import { Loader } from '@applifting-io/nestjs-dataloader';
import { BaseCkbBlock, CkbBlock } from '../block/block.model';
import { CkbCell } from '../cell/cell.model';
import { CkbTransactionLoader, CkbTransactionLoaderResponse } from './transaction.dataloader';
import { BI } from '@ckb-lumos/bi';

@Resolver(() => CkbTransaction)
export class CkbTransactionResolver {
  @ResolveField(() => [Float])
  public async fee(
    @Parent() transaction: CkbBaseTransaction,
    @Loader(CkbTransactionLoader)
    transactionLoader: DataLoader<string, CkbTransactionLoaderResponse>,
  ): Promise<number> {
    const inputs = await this.inputs(transaction, transactionLoader);
    const inputSum = inputs.reduce((sum, input) => sum + BI.from(input.capacity).toNumber(), 0);
    return inputSum - transaction.outputSum;
  }

  @ResolveField(() => [CkbCell])
  public async inputs(
    @Parent() transaction: CkbBaseTransaction,
    @Loader(CkbTransactionLoader)
    transactionLoader: DataLoader<string, CkbTransactionLoaderResponse>,
  ): Promise<CkbCell[]> {
    const tx = await transactionLoader.load(transaction.hash);
    const inputs = Promise.all(
      tx.transaction.inputs
        // Filter out cellbase transaction
        .filter((input) => !input.previous_output.tx_hash.endsWith('0'.repeat(64)))
        .map(async (_, index) => {
          const input = tx.transaction.inputs[index];
          const previousTx = await transactionLoader.load(input.previous_output.tx_hash);
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
  ): Promise<BaseCkbBlock> {
    const block = await blockLoader.load(transaction.blockNumber.toString());
    return CkbBlock.fromCkbRpc(block);
  }
}
