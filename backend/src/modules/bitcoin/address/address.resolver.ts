import { Loader } from '@applifting-io/nestjs-dataloader';
import { Args, Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { BitcoinBaseTransaction, BitcoinTransaction } from '../transaction/transaction.model';
import { BitcoinAddress, BitcoinBaseAddress } from './address.model';
import {
  BitcoinAddressLoader,
  BitcoinAddressLoaderType,
  BitcoinAddressTransactionsLoader,
  BitcoinAddressTransactionsLoaderType,
} from './address.dataloader';

@Resolver(() => BitcoinAddress)
export class BitcoinAddressResolver {
  @Query(() => BitcoinAddress, { name: 'btcAddress', nullable: true })
  public async getBtcAddress(@Args('address') address: string): Promise<BitcoinBaseAddress> {
    return BitcoinAddress.from(address);
  }

  @ResolveField(() => Float)
  public async satoshi(
    @Parent() address: BitcoinBaseAddress,
    @Loader(BitcoinAddressLoader) addressLoader: BitcoinAddressLoaderType,
  ): Promise<number> {
    const addressStats = await addressLoader.load(address.address);
    return addressStats.chain_stats.funded_txo_sum - addressStats.chain_stats.spent_txo_sum;
  }

  @ResolveField(() => Float)
  public async pendingSatoshi(
    @Parent() address: BitcoinBaseAddress,
    @Loader(BitcoinAddressLoader) addressLoader: BitcoinAddressLoaderType,
  ): Promise<number> {
    const addressStats = await addressLoader.load(address.address);
    return addressStats.mempool_stats.funded_txo_sum - addressStats.mempool_stats.spent_txo_sum;
  }

  @ResolveField(() => Float)
  public async transactionCount(
    @Parent() address: BitcoinBaseAddress,
    @Loader(BitcoinAddressLoader) addressLoader: BitcoinAddressLoaderType,
  ): Promise<number> {
    // TODO: addressInfo.mempool_stats.tx_count is not included in the response, not sure if it should be included
    const stats = await addressLoader.load(address.address);
    return stats.chain_stats.tx_count;
  }

  @ResolveField(() => [BitcoinTransaction])
  public async transactions(
    @Parent() address: BitcoinBaseAddress,
    @Loader(BitcoinAddressTransactionsLoader)
    addressTxsLoader: BitcoinAddressTransactionsLoaderType,
    @Args('afterTxid', { nullable: true }) afterTxid?: string,
  ): Promise<BitcoinBaseTransaction[]> {
    return await addressTxsLoader.load({
      address: address.address,
      afterTxid: afterTxid,
    });
  }
}
