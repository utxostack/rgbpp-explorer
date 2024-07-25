import DataLoader from 'dataloader';
import { Loader } from '@applifting-io/nestjs-dataloader';
import { Args, Float, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import { BitcoinBaseTransaction, BitcoinTransaction } from '../transaction/transaction.model';
import { BitcoinAddress } from './address.model';
import {
  BitcoinAddressBalanceLoader,
  BitcoinAddressBalanceLoaderResponse,
  BitcoinAddressLoader,
  BitcoinAddressLoaderResponse,
  BitcoinAddressTransactionsLoader,
  BitcoinAddressTransactionsLoaderProps,
  BitcoinAddressTransactionsLoaderResponse,
} from './address.dataloader';

@Resolver(() => BitcoinAddress)
export class BitcoinAddressResolver {
  constructor(private bitcoinApiService: BitcoinApiService) {}

  @ResolveField(() => Float)
  public async satoshi(
    @Parent() address: BitcoinAddress,
    @Loader(BitcoinAddressBalanceLoader)
    addressBalanceLoader: DataLoader<string, BitcoinAddressBalanceLoaderResponse>,
  ): Promise<number> {
    const { satoshi } = await addressBalanceLoader.load(address.address);
    return satoshi;
  }

  @ResolveField(() => Float)
  public async pendingSatoshi(
    @Parent() address: BitcoinAddress,
    @Loader(BitcoinAddressBalanceLoader)
    addressBalanceLoader: DataLoader<string, BitcoinAddressBalanceLoaderResponse>,
  ): Promise<number> {
    const { pendingSatoshi } = await addressBalanceLoader.load(address.address);
    return pendingSatoshi;
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
