import DataLoader from 'dataloader';
import { Loader } from '@applifting-io/nestjs-dataloader';
import { Args, Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { BitcoinBaseTransaction, BitcoinTransaction } from '../transaction/transaction.model';
import { BitcoinAddress } from './address.model';
import {
  BitcoinAddressLoader,
  BitcoinAddressLoaderResponse,
  BitcoinAddressTransactionsLoader,
  BitcoinAddressTransactionsLoaderProps,
  BitcoinAddressTransactionsLoaderResponse,
} from './address.dataloader';

@Resolver(() => BitcoinAddress)
export class BitcoinAddressResolver {
  @Query(() => BitcoinAddress, { name: 'btcAddress', nullable: true })
  public async getBtcAddress(
    @Loader(BitcoinAddressLoader) addressLoader: DataLoader<string, BitcoinAddress>,
    @Args('address') address: string,
  ): Promise<BitcoinAddress> {
    return await addressLoader.load(address);
  }

  @ResolveField(() => Float)
  public async satoshi(
    @Parent() address: BitcoinAddress,
    @Loader(BitcoinAddressLoader) addressLoader: DataLoader<string, BitcoinAddressLoaderResponse>,
  ): Promise<number> {
    const addressStats = await addressLoader.load(address.address);
    return addressStats.chain_stats.funded_txo_sum - addressStats.chain_stats.spent_txo_sum;
  }

  @ResolveField(() => Float)
  public async pendingSatoshi(
    @Parent() address: BitcoinAddress,
    @Loader(BitcoinAddressLoader) addressLoader: DataLoader<string, BitcoinAddressLoaderResponse>,
  ): Promise<number> {
    const addressStats = await addressLoader.load(address.address);
    return addressStats.mempool_stats.funded_txo_sum - addressStats.mempool_stats.spent_txo_sum;
  }

  @ResolveField(() => Float)
  public async transactionCount(
    @Parent() address: BitcoinAddress,
    @Loader(BitcoinAddressLoader) addressLoader: DataLoader<string, BitcoinAddressLoaderResponse>,
  ): Promise<number> {
    // TODO: addressInfo.mempool_stats.tx_count is not included in the response, not sure if it should be included
    const stats = await addressLoader.load(address.address);
    return stats.chain_stats.tx_count;
  }

  @ResolveField(() => [BitcoinTransaction])
  public async transactions(
    @Parent() address: BitcoinAddress,
    @Loader(BitcoinAddressTransactionsLoader)
    addressTxsLoader: DataLoader<
      BitcoinAddressTransactionsLoaderProps,
      BitcoinAddressTransactionsLoaderResponse
    >,
    @Args('afterTxid', { nullable: true }) afterTxid?: string,
  ): Promise<BitcoinBaseTransaction[]> {
    return await addressTxsLoader.load({
      address: address.address,
      afterTxid: afterTxid,
    });
  }
}
