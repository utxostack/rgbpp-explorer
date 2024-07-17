import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { RgbppBaseTransaction, RgbppTransaction } from './transaction.model';
import { RgbppTransactionService } from './transaction.service';
import { CkbBaseTransaction, CkbTransaction } from 'src/modules/ckb/transaction/transaction.model';
import { Loader } from '@applifting-io/nestjs-dataloader';
import {
  CkbTransactionLoader,
  CkbTransactionLoaderResponse,
} from 'src/modules/ckb/transaction/transaction.dataloader';
import DataLoader from 'dataloader';
import { CkbBlockLoader, CkbBlockLoaderResponse } from 'src/modules/ckb/block/block.dataloader';

@Resolver(() => RgbppTransaction)
export class RgbppTransactionResolver {
  constructor(private rgbppTransactionService: RgbppTransactionService) {}

  @Query(() => [RgbppTransaction], { name: 'getRgbppLatestTransactions' })
  public async getLatestRransaction(): Promise<RgbppBaseTransaction[]> {
    const transactions = await this.rgbppTransactionService.getLatestTransaction();
    return transactions.map((transaction) => RgbppTransaction.fromCkbExplorer(transaction));
  }

  @ResolveField(() => CkbTransaction)
  public async ckbTransaction(
    @Parent() tx: RgbppBaseTransaction,
    @Loader(CkbTransactionLoader)
    ckbTxLoader: DataLoader<string, CkbTransactionLoaderResponse>,
    @Loader(CkbBlockLoader)
    ckbBlockLoader: DataLoader<string, CkbBlockLoaderResponse>,
  ) {
    const ckbBlock = await ckbBlockLoader.load(tx.blockNumber.toString());
    const ckbTx = await ckbTxLoader.load(tx.ckbTxHash);
    return CkbTransaction.from(ckbBlock, ckbTx.transaction);
  }
}
