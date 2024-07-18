import { Query, ResolveField, Resolver } from '@nestjs/graphql';
import { BitcoinBaseChainInfo, BitcoinChainInfo, BitcoinFees } from './bitcoin.model';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';

@Resolver(() => BitcoinChainInfo)
export class BitcoinResolver {
  constructor(private bitcoinApiService: BitcoinApiService) {}

  @Query(() => BitcoinChainInfo, { name: 'btcChainInfo' })
  public async chainInfo(): Promise<BitcoinBaseChainInfo> {
    const info = await this.bitcoinApiService.getBlockchainInfo();
    return BitcoinChainInfo.from(info);
  }

  @ResolveField(() => BitcoinFees)
  public async fees(): Promise<BitcoinFees> {
    const fees = await this.bitcoinApiService.getFeesRecommended();
    return BitcoinFees.from(fees);
  }
}
