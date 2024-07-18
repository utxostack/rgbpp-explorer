import { Query, Resolver } from '@nestjs/graphql';
import { BitcoinChainInfo } from './bitcoin.model';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';

@Resolver(() => BitcoinChainInfo)
export class BitcoinResolver {
  constructor(private bitcoinApiService: BitcoinApiService) {}

  @Query(() => BitcoinChainInfo)
  public async getBitcoinChainInfo(): Promise<BitcoinChainInfo> {
    const info = await this.bitcoinApiService.getBlockchainInfo();
    return BitcoinChainInfo.from(info);
  }
}
