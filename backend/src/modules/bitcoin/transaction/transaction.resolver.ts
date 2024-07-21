import DataLoader from 'dataloader';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { Loader } from '@applifting-io/nestjs-dataloader';
import { BitcoinBaseTransaction, BitcoinTransaction } from './transaction.model';
import {
  BitcoinTransactionLoader,
  BitcoinTransactionLoaderResponse,
} from './transaction.dataloader';

@Resolver(() => BitcoinTransaction)
export class BitcoinTransactionResolver {
  @Query(() => BitcoinTransaction, { name: 'btcTransaction', nullable: true })
  public async getTransaction(
    @Args('txid') txid: string,
    @Loader(BitcoinTransactionLoader)
    transactionLoader: DataLoader<string, BitcoinTransactionLoaderResponse>,
  ): Promise<BitcoinBaseTransaction | null> {
    const transaction = await transactionLoader.load(txid);
    return BitcoinTransaction.from(transaction);
  }
}
