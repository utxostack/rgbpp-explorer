import { Loader } from '@applifting-io/nestjs-dataloader';
import { Args, Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { RgbppAddress } from 'src/modules/rgbpp/address/address.model';
import { BitcoinBaseTransaction, BitcoinTransaction } from '../transaction/transaction.model';
import { BitcoinAddress, BitcoinBaseAddress } from './address.model';
import {
  BitcoinAddressLoader,
  BitcoinAddressLoaderType,
  BitcoinAddressTransactionsLoader,
  BitcoinAddressTransactionsLoaderType,
} from './address.dataloader';
import { ValidateBtcAddressPipe } from 'src/pipes/validate-address.pipe';

@Resolver(() => BitcoinAddress)
export class BitcoinAddressResolver {
  @Query(() => BitcoinAddress, { name: 'btcAddress', nullable: true })
  public async getBtcAddress(
    @Args('address', ValidateBtcAddressPipe) address: string,
  ): Promise<BitcoinBaseAddress | null> {
    return BitcoinAddress.from(address);
  }

  @ResolveField(() => Float)
  public async satoshi(
    @Parent() address: BitcoinBaseAddress,
    @Loader(BitcoinAddressLoader) addressLoader: BitcoinAddressLoaderType,
  ): Promise<number | null> {
    const addressStats = await addressLoader.load(address.address);
    if (!addressStats) {
      return null;
    }
    return addressStats.chain_stats.funded_txo_sum - addressStats.chain_stats.spent_txo_sum;
  }

  @ResolveField(() => Float)
  public async pendingSatoshi(
    @Parent() address: BitcoinBaseAddress,
    @Loader(BitcoinAddressLoader) addressLoader: BitcoinAddressLoaderType,
  ): Promise<number | null> {
    const addressStats = await addressLoader.load(address.address);
    if (!addressStats) {
      return null;
    }
    return addressStats.mempool_stats.funded_txo_sum - addressStats.mempool_stats.spent_txo_sum;
  }

  @ResolveField(() => Float, { nullable: true })
  public async transactionsCount(
    @Parent() address: BitcoinBaseAddress,
    @Loader(BitcoinAddressLoader) addressLoader: BitcoinAddressLoaderType,
  ): Promise<number | null> {
    // TODO: addressInfo.mempool_stats.tx_count is not included in the response, not sure if it should be included
    const stats = await addressLoader.load(address.address);
    if (!stats) {
      return null;
    }
    return stats.chain_stats.tx_count;
  }

  @ResolveField(() => [BitcoinTransaction], { nullable: true })
  public async transactions(
    @Parent() address: BitcoinBaseAddress,
    @Loader(BitcoinAddressTransactionsLoader)
    addressTxsLoader: BitcoinAddressTransactionsLoaderType,
    @Args('afterTxid', { nullable: true }) afterTxid?: string,
  ): Promise<BitcoinBaseTransaction[] | null> {
    const list = await addressTxsLoader.load({
      address: address.address,
      afterTxid: afterTxid,
    });
    return list || null;
  }

  @ResolveField(() => RgbppAddress)
  public async rgbppAddress(@Parent() address: BitcoinBaseAddress): Promise<RgbppAddress> {
    return RgbppAddress.from(address.address);
  }
}
