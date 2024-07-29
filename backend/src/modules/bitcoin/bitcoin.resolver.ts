import { Float, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import { BitcoinBaseChainInfo, BitcoinChainInfo, BitcoinFees } from './bitcoin.model';

@Resolver(() => BitcoinChainInfo)
export class BitcoinResolver {
  constructor(private bitcoinApiService: BitcoinApiService) {}

  @Query(() => BitcoinChainInfo, { name: 'btcChainInfo' })
  public async chainInfo(): Promise<BitcoinBaseChainInfo> {
    const info = await this.bitcoinApiService.getBlockchainInfo();
    return BitcoinChainInfo.from(info);
  }

  @ResolveField(() => Float)
  public async transactionsCountIn24Hours(): Promise<number> {
    // TODO: implement this resolver
    return 0;
  }

  @ResolveField(() => BitcoinFees)
  public async fees(): Promise<BitcoinFees> {
    const fees = await this.bitcoinApiService.getFeesRecommended();
    return BitcoinFees.from(fees);
  }
}
