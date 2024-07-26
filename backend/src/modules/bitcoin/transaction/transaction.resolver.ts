import DataLoader from 'dataloader';
import { Args, Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Loader } from '@applifting-io/nestjs-dataloader';
import { BitcoinApiService } from '../../../core/bitcoin-api/bitcoin-api.service';
import { BitcoinBaseTransaction, BitcoinTransaction } from './transaction.model';
import {
  BitcoinTransactionLoader,
  BitcoinTransactionLoaderResponse,
} from './transaction.dataloader';
import { BitcoinOutputSpend } from '../spend/spend.model';

@Resolver(() => BitcoinTransaction)
export class BitcoinTransactionResolver {
  constructor(private bitcoinApiService: BitcoinApiService) {}

  @Query(() => BitcoinTransaction, { name: 'btcTransaction', nullable: true })
  public async getTransaction(
    @Args('txid') txid: string,
    @Loader(BitcoinTransactionLoader)
    transactionLoader: DataLoader<string, BitcoinTransactionLoaderResponse>,
  ): Promise<BitcoinBaseTransaction | null> {
    const transaction = await transactionLoader.load(txid);
    return BitcoinTransaction.from(transaction);
  }

  @ResolveField(() => [BitcoinOutputSpend])
  public async outSpends(@Parent() transaction: BitcoinTransaction): Promise<BitcoinOutputSpend[]> {
    const outSpends = await this.bitcoinApiService.getTxOutSpends({
      txid: transaction.txid,
    });
    return outSpends.map(BitcoinOutputSpend.from);
  }

  @ResolveField(() => Float)
  public async confirmations(@Parent() transaction: BitcoinTransaction): Promise<number> {
    if (!transaction.confirmed) {
      return 0;
    }

    // TODO: should this resolver be refactored with a dataloader?
    const info = await this.bitcoinApiService.getBlockchainInfo();
    return info.blocks - transaction.blockHeight + 1;
  }
}
