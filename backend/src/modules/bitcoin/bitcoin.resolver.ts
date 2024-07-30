import { Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import { BitcoinBaseChainInfo, BitcoinChainInfo, BitcoinFees } from './bitcoin.model';
import { Loader } from '@applifting-io/nestjs-dataloader';
import {
  BitcoinBlockTransactionsLoader,
  BitcoinBlockTransactionsLoaderType,
} from './block/block.dataloader';

// 60 * 24 = 1440 minutes
const BLOCK_NUMBER_OF_24_HOURS = 144;

@Resolver(() => BitcoinChainInfo)
export class BitcoinResolver {
  constructor(private bitcoinApiService: BitcoinApiService) { }

  @Query(() => BitcoinChainInfo, { name: 'btcChainInfo' })
  public async chainInfo(): Promise<BitcoinBaseChainInfo> {
    const info = await this.bitcoinApiService.getBlockchainInfo();
    return BitcoinChainInfo.from(info);
  }

  @ResolveField(() => Float)
  public async transactionsCountIn24Hours(
    @Parent() chainInfo: BitcoinBaseChainInfo,
    @Loader(BitcoinBlockTransactionsLoader) blockTxsLoader: BitcoinBlockTransactionsLoaderType,
  ): Promise<number> {
    const blockNumbers = Array.from(
      { length: BLOCK_NUMBER_OF_24_HOURS },
      (_, i) => chainInfo.tipBlockHeight - i,
    );
    const transactions = await blockTxsLoader.loadMany(
      blockNumbers.map((blockNumber) => ({ height: blockNumber })),
    );
    const count = transactions
      .map((txs) => (txs instanceof Array ? txs : []))
      .reduce((acc, txs) => acc + txs?.length ?? 0, 0);
    return count;
  }

  @ResolveField(() => BitcoinFees)
  public async fees(): Promise<BitcoinFees> {
    const fees = await this.bitcoinApiService.getFeesRecommended();
    return BitcoinFees.from(fees);
  }
}
