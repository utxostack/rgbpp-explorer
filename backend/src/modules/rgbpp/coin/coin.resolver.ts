import { Args, Float, Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import { TransactionListSortType, XUDTTag } from 'src/core/ckb-explorer/ckb-explorer.interface';
import { RgbppBaseTransaction, RgbppTransaction } from '../transaction/transaction.model';
import { RgbppBaseCoin, RgbppCoin, RgbppCoinList } from './coin.model';
import { Loader } from '@applifting-io/nestjs-dataloader';
import {
  CkbExplorerXUDTTransactionsLoader,
  CkbExplorerXUDTTransactionsLoaderType,
} from './coin.dataloader';

@Resolver(() => RgbppCoin)
export class RgbppCoinResolver {
  constructor(private ckbExplorerService: CkbExplorerService) {}

  @Query(() => RgbppCoinList, { name: 'rgbppCoins' })
  public async coins(
    @Args('page', { type: () => Int, nullable: true }) page: number = 1,
    @Args('pageSize', { type: () => Int, nullable: true }) pageSize: number = 10,
    @Args('sort', { type: () => TransactionListSortType, nullable: true })
    sort = TransactionListSortType.TransactionsDesc,
  ): Promise<RgbppCoinList> {
    const response = await this.ckbExplorerService.getXUDTList({
      page,
      pageSize,
      sort,
      tags: [XUDTTag.RgbppCompatible],
    });
    const coins = response.data.map((coin) => RgbppCoin.from(coin.attributes));
    return {
      coins,
      total: response.meta.total,
      pageSize: response.meta.page_size,
    };
  }

  @Query(() => RgbppCoin, { name: 'rgbppCoin' })
  public async coin(
    @Args('typeHash', { type: () => String }) typeHash: string,
  ): Promise<RgbppBaseCoin> {
    const response = await this.ckbExplorerService.getXUDT(typeHash);
    return RgbppCoin.from(response.data.attributes);
  }

  @ResolveField(() => [RgbppTransaction], { nullable: true })
  public async transactions(
    @Parent() coin: RgbppBaseCoin,
    @Args('page', { type: () => Int, nullable: true }) page: number = 1,
    @Args('pageSize', { type: () => Int, nullable: true }) pageSize: number = 10,
    @Loader(CkbExplorerXUDTTransactionsLoader) txsLoader: CkbExplorerXUDTTransactionsLoaderType,
  ): Promise<RgbppBaseTransaction[] | null> {
    const transactions = await txsLoader.load({
      typeHash: coin.typeHash,
      page,
      pageSize,
    });
    if (!transactions) {
      return null;
    }
    return transactions.data.map((tx) => RgbppTransaction.fromCkbTransaction(tx.attributes));
  }

  @ResolveField(() => Float, { nullable: true })
  public async transactionsCount(
    @Parent() coin: RgbppBaseCoin,
    @Loader(CkbExplorerXUDTTransactionsLoader) txsLoader: CkbExplorerXUDTTransactionsLoaderType,
  ): Promise<number | null> {
    const transactions = await txsLoader.load({
      typeHash: coin.typeHash,
      page: 1,
      pageSize: 1,
    });
    if (!transactions) {
      return null;
    }
    return transactions.meta.total;
  }
}
