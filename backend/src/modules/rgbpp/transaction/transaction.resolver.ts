import { Loader } from '@applifting-io/nestjs-dataloader';
import { Args, Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbBaseTransaction, CkbTransaction } from 'src/modules/ckb/transaction/transaction.model';
import {
  CkbRpcTransactionLoader,
  CkbRpcTransactionLoaderType,
} from 'src/modules/ckb/transaction/transaction.dataloader';
import {
  BitcoinBaseTransaction,
  BitcoinTransaction,
} from 'src/modules/bitcoin/transaction/transaction.model';
import { RgbppTransactionService } from './transaction.service';
import {
  BitcoinTransactionLoader,
  BitcoinTransactionLoaderType,
} from 'src/modules/bitcoin/transaction/transaction.dataloader';
import {
  RgbppTransaction,
  RgbppBaseTransaction,
  RgbppLatestTransactionList,
  LeapDirection,
} from './transaction.model';
import { RgbppTransactionLoader, RgbppTransactionLoaderType } from './transaction.dataloader';
import { HashType, Output } from '@ckb-lumos/lumos';
import { RgbppService } from '../rgbpp.service';

@Resolver(() => RgbppTransaction)
export class RgbppTransactionResolver {
  constructor(
    private rgbppTransactionService: RgbppTransactionService,
    private rgbppService: RgbppService,
  ) { }

  @Query(() => RgbppLatestTransactionList, { name: 'rgbppLatestTransactions' })
  public async getLatestTransactions(
    @Args('page', { type: () => Int, nullable: true }) page: number = 1,
    @Args('pageSize', { type: () => Int, nullable: true }) pageSize: number = 10,
  ): Promise<RgbppLatestTransactionList> {
    return await this.rgbppTransactionService.getLatestTransactions(page, pageSize);
  }

  @Query(() => RgbppTransaction, { name: 'rgbppTransaction', nullable: true })
  public async getTransaction(
    @Args('txidOrTxHash') txidOrTxHash: string,
    @Loader(RgbppTransactionLoader) txLoader: RgbppTransactionLoaderType,
  ): Promise<RgbppBaseTransaction | null> {
    const tx = await txLoader.load(txidOrTxHash);
    return tx || null;
  }

  @ResolveField(() => LeapDirection, { nullable: true })
  public async leapDirection(
    @Parent() tx: RgbppBaseTransaction,
    @Loader(CkbRpcTransactionLoader) ckbRpcTxLoader: CkbRpcTransactionLoaderType,
  ): Promise<LeapDirection | null> {
    const ckbTx = await ckbRpcTxLoader.load(tx.ckbTxHash);
    if (!ckbTx) {
      return null;
    }
    const inputCells: Output[] = await Promise.all(
      ckbTx.transaction.inputs.map(async (input) => {
        const inputTx = await ckbRpcTxLoader.load(input.previous_output.tx_hash);
        return inputTx?.transaction.outputs?.[input.previous_output.index] ?? null;
      }),
    );
    const hasRgbppLockInput = inputCells.some(
      (cell) => cell?.lock && this.rgbppService.isRgbppLockScript(cell.lock),
    );
    const hasRgbppLockOuput = ckbTx.transaction.outputs.some(
      (output) =>
        output?.lock &&
        this.rgbppService.isRgbppLockScript({
          codeHash: output.lock.code_hash,
          hashType: output.lock.hash_type as HashType,
          args: output.lock.args,
        }),
    );
    const hasBtcTimeLockOutput = ckbTx.transaction.outputs.some(
      (output) =>
        output.lock &&
        this.rgbppService.isBtcTimeLockScript({
          codeHash: output.lock.code_hash,
          hashType: output.lock.hash_type as HashType,
          args: output.lock.args,
        }),
    );

    if (hasRgbppLockInput && hasBtcTimeLockOutput) {
      return LeapDirection.LeapOut;
    }
    if (hasRgbppLockInput && hasRgbppLockOuput) {
      return LeapDirection.Within;
    }
    if (!hasRgbppLockInput && hasRgbppLockOuput) {
      return LeapDirection.LeapIn;
    }
    return null;
  }

  @ResolveField(() => CkbTransaction, { nullable: true })
  public async ckbTransaction(
    @Parent() tx: RgbppBaseTransaction,
    @Loader(CkbRpcTransactionLoader) ckbRpcTxLoader: CkbRpcTransactionLoaderType,
  ): Promise<CkbBaseTransaction | null> {
    const ckbTx = await ckbRpcTxLoader.load(tx.ckbTxHash);
    if (!ckbTx) {
      return null;
    }
    return CkbTransaction.from(ckbTx);
  }

  @ResolveField(() => BitcoinTransaction, { nullable: true })
  public async btcTransaction(
    @Parent() tx: RgbppBaseTransaction,
    @Loader(BitcoinTransactionLoader) txLoader: BitcoinTransactionLoaderType,
  ): Promise<BitcoinBaseTransaction | null> {
    if (!tx.btcTxid) {
      return null;
    }
    const btcTx = await txLoader.load(tx.btcTxid);
    if (!btcTx) {
      return null;
    }
    return BitcoinTransaction.from(btcTx);
  }
}
