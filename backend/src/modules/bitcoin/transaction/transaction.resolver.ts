import { Loader } from '@applifting-io/nestjs-dataloader';
import { Args, Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import { BitcoinTransactionLoader, BitcoinTransactionLoaderType } from './transaction.dataloader';
import { BitcoinBaseTransaction, BitcoinTransaction } from './transaction.model';
import { BitcoinOutputSpend } from '../spend/spend.model';

@Resolver(() => BitcoinTransaction)
export class BitcoinTransactionResolver {
  constructor(private bitcoinApiService: BitcoinApiService) {}

  @Query(() => BitcoinTransaction, { name: 'btcTransaction', nullable: true })
  public async getTransaction(
    @Args('txid') txid: string,
    @Loader(BitcoinTransactionLoader) txLoader: BitcoinTransactionLoaderType,
  ): Promise<BitcoinBaseTransaction | null> {
    const transaction = await txLoader.load(txid);
    return BitcoinTransaction.from(transaction);
  }

  @ResolveField(() => [BitcoinOutputSpend])
  public async outSpends(@Parent() tx: BitcoinBaseTransaction): Promise<BitcoinOutputSpend[]> {
    const outSpends = await this.bitcoinApiService.getTxOutSpends({
      txid: tx.txid,
    });
    return outSpends.map(BitcoinOutputSpend.from);
  }

  @ResolveField(() => Float)
  public async confirmations(@Parent() tx: BitcoinBaseTransaction): Promise<number> {
    if (!tx.confirmed) {
      return 0;
    }

    // TODO: should this resolver be refactored with a dataloader?
    const info = await this.bitcoinApiService.getBlockchainInfo();
    return info.blocks - tx.blockHeight + 1;
  }
}
