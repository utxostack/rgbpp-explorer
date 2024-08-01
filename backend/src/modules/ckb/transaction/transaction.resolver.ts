import { BI } from '@ckb-lumos/bi';
import { toNumber } from 'lodash';
import { Loader } from '@applifting-io/nestjs-dataloader';
import { Args, Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbRpcBlockLoader, CkbRpcBlockLoaderType } from '../block/block.dataloader';
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
    @Loader(CkbRpcTransactionLoader) rpcTxLoader: CkbRpcTransactionLoaderType,
  ): Promise<CkbBaseTransaction | null> {
    const tx = await rpcTxLoader.load(txHash);
    if (!tx) {
      return null;
    }
    return CkbTransaction.from(tx);
  }

  @ResolveField(() => [CkbCell], { nullable: true })
  public async inputs(
    @Parent() tx: CkbBaseTransaction,
    @Loader(CkbRpcTransactionLoader) rpcTxLoader: CkbRpcTransactionLoaderType,
  ): Promise<(CkbBaseCell | null)[] | null> {
    const rpcTx = await rpcTxLoader.load(tx.hash);
    if (!rpcTx) {
      return null;
    }
    return Promise.all(
      rpcTx.transaction.inputs
        // Filter out cellbase transaction
        .filter((input) => !input.previous_output.tx_hash.endsWith('0'.repeat(64)))
        .map(async (_, i) => {
          const input = rpcTx.transaction.inputs[i];
          const previousTx = await rpcTxLoader.load(input.previous_output.tx_hash);
          if (!previousTx) {
            return null;
          }
          const index = BI.from(input.previous_output.index).toNumber();
          return CkbCell.fromTransaction(previousTx.transaction, index);
        }),
    );
  }

  @ResolveField(() => CkbBlock, { nullable: true })
  public async block(
    @Parent() tx: CkbBaseTransaction,
    @Loader(CkbRpcBlockLoader) rpcBlockLoader: CkbRpcBlockLoaderType,
  ): Promise<CkbBaseBlock | null> {
    const block = await rpcBlockLoader.load(tx.blockNumber.toString());
    if (!block) {
      return null;
    }
    return CkbBlock.from(block);
  }

  @ResolveField(() => Float, { nullable: true })
  public async fee(
    @Parent() tx: CkbBaseTransaction,
    @Loader(CkbExplorerTransactionLoader) explorerTxLoader: CkbExplorerTransactionLoaderType,
  ): Promise<number | null> {
    const explorerTx = await explorerTxLoader.load(tx.hash);
    if (!explorerTx) {
      return null;
    }
    return toNumber(explorerTx.transaction_fee);
  }

  @ResolveField(() => Float, { nullable: true })
  public async feeRate(
    @Parent() tx: CkbBaseTransaction,
    @Loader(CkbExplorerTransactionLoader) explorerTxLoader: CkbExplorerTransactionLoaderType,
  ): Promise<number | null> {
    const explorerTx = await explorerTxLoader.load(tx.hash);
    if (!explorerTx) {
      return null;
    }
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
