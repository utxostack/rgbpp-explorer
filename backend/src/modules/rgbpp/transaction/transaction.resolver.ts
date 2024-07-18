import { Args, Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { RgbppBaseTransaction, RgbppTransaction } from './transaction.model';
import { CkbTransaction } from 'src/modules/ckb/transaction/transaction.model';
import { Loader } from '@applifting-io/nestjs-dataloader';
import {
  CkbTransactionLoader,
  CkbTransactionLoaderResponse,
} from 'src/modules/ckb/transaction/transaction.dataloader';
import DataLoader from 'dataloader';
import { CkbBlockLoader, CkbBlockLoaderResponse } from 'src/modules/ckb/block/block.dataloader';
import { BitcoinTransaction } from 'src/modules/bitcoin/transaction/transaction.model';
import {
  BitcoinTransactionLoader,
  BitcoinTransactionLoaderResponse,
} from 'src/modules/bitcoin/transaction/transaction.dataloader';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';

@Resolver(() => RgbppTransaction)
export class RgbppTransactionResolver {
  constructor(private ckbExplorerService: CkbExplorerService) { }

  @Query(() => [RgbppTransaction], { name: 'rgbppLatestTransactions' })
  public async getLatestRransaction(
    @Args('page', { type: () => Int, nullable: true }) page: number = 1,
    @Args('pageSize', { type: () => Int, nullable: true }) pageSize: number = 10,
  ): Promise<RgbppBaseTransaction[]> {
    const response = await this.ckbExplorerService.getRgbppTransactions({
      page,
      pageSize,
    });
    return response.data.ckb_transactions.map((transaction) =>
      RgbppTransaction.fromCkbExplorer(transaction),
    );
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

  @ResolveField(() => BitcoinTransaction)
  public async btcTransaction(
    @Parent() tx: RgbppBaseTransaction,
    @Loader(BitcoinTransactionLoader)
    btcTxLoader: DataLoader<string, BitcoinTransactionLoaderResponse>,
  ) {
    const btcTx = await btcTxLoader.load(tx.btcTxid);
    return BitcoinTransaction.from(btcTx);
  }
}
