import { Args, Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import { XUDTTag } from 'src/core/ckb-explorer/ckb-explorer.interface';
import { RgbppTransaction } from '../transaction/transaction.model';
import { RgbppBaseCoin, RgbppCoin, RgbppCoinList } from './coin.model';

@Resolver(() => RgbppCoin)
export class RgbppCoinResolver {
  constructor(private ckbExplorerService: CkbExplorerService) {}

  @Query(() => RgbppCoinList, { name: 'rgbppCoinList' })
  public async coins(
    @Args('page', { type: () => Int, nullable: true }) page: number = 1,
    @Args('pageSize', { type: () => Int, nullable: true }) pageSize: number = 10,
  ): Promise<RgbppCoinList> {
    const response = await this.ckbExplorerService.getXUDTList({
      page,
      pageSize,
      tags: [XUDTTag.RgbppCompatible],
    });
    const coins = response.data.map((coin) => RgbppCoin.from(coin.attributes));
    return {
      coins,
      total: response.meta.total,
      page: response.meta.page_size,
    };
  }

  @Query(() => RgbppCoin, { name: 'rgbppCoin' })
  public async coin(
    @Args('typeHash', { type: () => String }) typeHash: string,
  ): Promise<RgbppBaseCoin> {
    const response = await this.ckbExplorerService.getXUDT(typeHash);
    return RgbppCoin.from(response.data.attributes);
  }

  @ResolveField(() => [RgbppTransaction])
  public async transactions(
    @Parent() coin: RgbppBaseCoin,
    @Args('page', { type: () => Int, nullable: true }) page: number = 1,
    @Args('pageSize', { type: () => Int, nullable: true }) pageSize: number = 10,
  ) {
    // XXX: should we implement dataloader here?
    const response = await this.ckbExplorerService.getXUDTTransactions(coin.typeHash, {
      page,
      pageSize,
    });
    return response.data.map((tx) => RgbppTransaction.fromCkbTransaction(tx.attributes));
  }
}
