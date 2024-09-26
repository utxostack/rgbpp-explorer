import { BI } from '@ckb-lumos/bi';
import { toNumber } from 'lodash';
import { Loader } from 'src/common/dataloader';
import { Args, Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbRpcBlockLoader, CkbRpcBlockLoaderType } from '../block/block.dataloader';
import { CkbBlock } from '../block/block.model';
import { CkbCell } from '../cell/cell.model';
import { CkbTransactionService } from './transaction.service';
import { CkbTransaction, CkbSearchKeyInput } from './transaction.model';
import {
  CkbRpcTransactionLoader,
  CkbRpcTransactionLoaderType,
  CkbExplorerTransactionLoader,
  CkbExplorerTransactionLoaderType,
} from './transaction.dataloader';
import { BadRequestException, Logger } from '@nestjs/common';
import { CellType } from '../script/script.model';
import { CkbScriptService } from '../script/script.service';
import { OrderType } from 'src/modules/api.model';
import { BaseScriptService } from '../script/base/base-script.service';
import * as Sentry from '@sentry/nestjs';

@Resolver(() => CkbTransaction)
export class CkbTransactionResolver {
  private logger = new Logger(CkbTransactionResolver.name);

  constructor(
    private ckbTransactionService: CkbTransactionService,
    private ckbScriptService: CkbScriptService,
  ) { }

  @Query(() => [CkbTransaction], {
    name: 'ckbTransactions',
    complexity: ({ args, childComplexity }) => (args.limit ?? 10) * childComplexity,
  })
  public async getTransactions(
    @Args('types', { type: () => [CellType], nullable: true }) types: CellType[] | null,
    @Args('scriptKey', { type: () => CkbSearchKeyInput, nullable: true })
    scriptKey: CkbSearchKeyInput | null,
    @Args('limit', { type: () => Float, nullable: true }) limit: number = 10,
    @Args('order', { type: () => OrderType, nullable: true }) order: OrderType = OrderType.Desc,
    @Args('after', { type: () => String, nullable: true }) after: string | null,
  ): Promise<CkbTransaction[]> {
    if (types && scriptKey) {
      throw new BadRequestException('Only one of types and scriptKey can be provided');
    }

    if (types) {
      const txs = await Promise.allSettled(
        types.map(async (cellType) => {
          const service = this.ckbScriptService.getServiceByCellType(cellType);
          const txs = await service.getTransactions(limit, order, after || undefined);
          return txs;
        }),
      );
      txs.forEach((tx) => {
        if (tx.status === 'rejected') {
          this.logger.error(tx.reason);
          Sentry.captureException(tx.reason);
        }
      });

      const orderedTxHashes = txs
        .map((tx) => (tx.status === 'fulfilled' ? tx.value.map((t) => t) : []))
        .flat()
        .sort((a, b) => BaseScriptService.sortTransactionCmp(a, b, order))
        .slice(0, limit)
        .map((tx) => tx.tx_hash);

      const orderedTxs = await Promise.all(
        orderedTxHashes.map(async (txHash) => {
          const tx = await this.ckbTransactionService.getTransactionFromRpc(txHash);
          return CkbTransaction.from(tx);
        }),
      );
      return orderedTxs.filter((tx) => !!tx);
    }

    if (scriptKey) {
      const result = await this.ckbTransactionService.getTransactions(
        scriptKey,
        order,
        limit,
        after || undefined,
      );
      const txs = await Promise.all(
        result.objects.map(async (tx) => {
          const txWithStatus = await this.ckbTransactionService.getTransactionFromRpc(tx.tx_hash);
          return CkbTransaction.from(txWithStatus);
        }),
      );
      return txs.filter((tx) => !!tx);
    }

    throw new BadRequestException('One of types and scriptKey must be provided');
  }

  @Query(() => CkbTransaction, { name: 'ckbTransaction', nullable: true })
  public async getTransaction(
    @Args('txHash') txHash: string,
    @Loader(CkbRpcTransactionLoader) rpcTxLoader: CkbRpcTransactionLoaderType,
  ): Promise<CkbTransaction | null> {
    const tx = await rpcTxLoader.load(txHash);
    if (!tx) {
      return null;
    }
    return CkbTransaction.from(tx);
  }

  @ResolveField(() => [CkbCell], {
    nullable: true,
  })
  public async inputs(
    @Parent() tx: CkbTransaction,
    @Loader(CkbRpcTransactionLoader) rpcTxLoader: CkbRpcTransactionLoaderType,
  ): Promise<(CkbCell | null)[] | null> {
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
    @Parent() tx: CkbTransaction,
    @Loader(CkbRpcBlockLoader) rpcBlockLoader: CkbRpcBlockLoaderType,
  ): Promise<CkbBlock | null> {
    const block = await rpcBlockLoader.load(tx.blockNumber.toString());
    if (!block) {
      return null;
    }
    return CkbBlock.from(block);
  }

  @ResolveField(() => Float, { nullable: true })
  public async fee(
    @Parent() tx: CkbTransaction,
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
    @Parent() tx: CkbTransaction,
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
  public async confirmations(@Parent() tx: CkbTransaction): Promise<number> {
    if (!tx.confirmed) {
      return 0;
    }
    const tipBlockNumber = await this.ckbTransactionService.getTipBlockNumber();
    const blockNumber = tx.blockNumber;
    return tipBlockNumber - blockNumber + 1;
  }
}
