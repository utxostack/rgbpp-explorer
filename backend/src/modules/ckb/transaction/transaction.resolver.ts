import DataLoader from 'dataloader';
import { BI } from '@ckb-lumos/bi';
import { toNumber } from 'lodash';
import { Loader } from '@applifting-io/nestjs-dataloader';
import { Args, Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbBlockLoader, CkbBlockLoaderResponse } from '../block/block.dataloader';
import { CkbBaseBlock, CkbBlock } from '../block/block.model';
import { CkbBaseCell, CkbCell } from '../cell/cell.model';
import { CkbTransactionService } from './transaction.service';
import { CkbTransaction, CkbBaseTransaction } from './transaction.model';
import {
  CkbRpcTransactionLoader,
  CkbRpcTransactionLoaderType,
  CkbExplorerTransactionLoader,
  CkbExplorerTransactionLoaderType,
} from './transaction.dataloader';

@Resolver(() => CkbTransaction)
export class CkbTransactionResolver {
  constructor(private ckbTransactionService: CkbTransactionService) {}

  @Query(() => CkbTransaction, { name: 'ckbTransaction', nullable: true })
  public async getTransaction(
    @Args('txHash') txHash: string,
    @Loader(CkbRpcTransactionLoader) ckbRpcTxLoader: CkbRpcTransactionLoaderType,
  ): Promise<CkbBaseTransaction | null> {
    const tx = await ckbRpcTxLoader.load(txHash);
    if (!tx) {
      return null;
    }
    return CkbTransaction.from(tx);
  }

  @ResolveField(() => [CkbCell])
  public async inputs(
    @Parent() tx: CkbBaseTransaction,
    @Loader(CkbRpcTransactionLoader) ckbRpcTxLoader: CkbRpcTransactionLoaderType,
  ): Promise<CkbBaseCell[]> {
    const rpcTx = await ckbRpcTxLoader.load(tx.hash);
    return Promise.all(
      rpcTx.transaction.inputs
        // Filter out cellbase transaction
        .filter((input) => !input.previous_output.tx_hash.endsWith('0'.repeat(64)))
        .map(async (_, i) => {
          const input = rpcTx.transaction.inputs[i];
          const previousTx = await ckbRpcTxLoader.load(input.previous_output.tx_hash);
          const index = BI.from(input.previous_output.index).toNumber();
          return CkbCell.from(previousTx.transaction, index);
        }),
    );
  }

  @ResolveField(() => CkbBlock)
  public async block(
    @Parent() tx: CkbBaseTransaction,
    @Loader(CkbBlockLoader) blockLoader: DataLoader<string, CkbBlockLoaderResponse>,
  ): Promise<CkbBaseBlock> {
    const block = await blockLoader.load(tx.blockNumber.toString());
    return CkbBlock.from(block);
  }

  @ResolveField(() => Float)
  public async fee(
    @Parent() tx: CkbBaseTransaction,
    @Loader(CkbExplorerTransactionLoader) ckbExplorerTxLoader: CkbExplorerTransactionLoaderType,
  ): Promise<number> {
    const explorerTx = await ckbExplorerTxLoader.load(tx.hash);
    return toNumber(explorerTx.transaction_fee);
  }

  @ResolveField(() => Float)
  public async feeRate(
    @Parent() tx: CkbBaseTransaction,
    @Loader(CkbExplorerTransactionLoader) ckbExplorerTxLoader: CkbExplorerTransactionLoaderType,
  ): Promise<number> {
    const explorerTx = await ckbExplorerTxLoader.load(tx.hash);
    const fee = BI.from(explorerTx.transaction_fee);
    const size = BI.from(tx.size);
    const ratio = BI.from(1000);
    return fee.mul(ratio).div(size).toNumber();
  }

  @ResolveField(() => Float)
  public async confirmations(@Parent() tx: CkbBaseTransaction): Promise<number> {
    if (!tx.confirmed) {
      return 0;
    }
    const tipBlockNumber = await this.ckbTransactionService.getTipBlockNumber();
    const blockNumber = tx.blockNumber;
    return tipBlockNumber - blockNumber + 1;
  }
}
