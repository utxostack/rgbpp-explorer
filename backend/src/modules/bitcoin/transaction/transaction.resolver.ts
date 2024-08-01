import { Loader } from '@applifting-io/nestjs-dataloader';
import { Args, Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import { BitcoinBaseTransaction, BitcoinTransaction } from './transaction.model';
import { BitcoinTransactionLoader, BitcoinTransactionLoaderType } from './transaction.dataloader';
import {
  RgbppBaseTransaction,
  RgbppTransaction,
} from 'src/modules/rgbpp/transaction/transaction.model';
import {
  RgbppTransactionLoader,
  RgbppTransactionLoaderType,
} from 'src/modules/rgbpp/transaction/transaction.dataloader';
import { BitcoinBaseBlock, BitcoinBlock } from '../block/block.model';
import { BitcoinBlockLoader, BitcoinBlockLoaderType } from '../block/dataloader/block.loader';

@Resolver(() => BitcoinTransaction)
export class BitcoinTransactionResolver {
  constructor(private bitcoinApiService: BitcoinApiService) { }

  @Query(() => BitcoinTransaction, { name: 'btcTransaction', nullable: true })
  public async getTransaction(
    @Args('txid') txid: string,
    @Loader(BitcoinTransactionLoader) txLoader: BitcoinTransactionLoaderType,
  ): Promise<BitcoinBaseTransaction | null> {
    const transaction = await txLoader.load(txid);
    if (!transaction) {
      return null;
    }
    return BitcoinTransaction.from(transaction);
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

  @ResolveField(() => BitcoinBlock, { nullable: true })
  public async block(
    @Parent() tx: BitcoinBaseTransaction,
    @Loader(BitcoinBlockLoader) blockLoader: BitcoinBlockLoaderType,
  ): Promise<BitcoinBaseBlock | null> {
    const block = await blockLoader.load(tx.blockHash);
    if (!block) {
      return null;
    }
    return BitcoinBlock.from(block);
  }

  @ResolveField(() => RgbppTransaction, { nullable: true })
  public async rgbppTransaction(
    @Parent() tx: BitcoinBaseTransaction,
    @Loader(RgbppTransactionLoader) txLoader: RgbppTransactionLoaderType,
  ): Promise<RgbppBaseTransaction | null> {
    const result = await txLoader.load(tx.txid);
    return result || null;
  }
}
