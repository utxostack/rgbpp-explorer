import { BI } from '@ckb-lumos/bi';
import { toNumber } from 'lodash';
import { Loader } from '@applifting-io/nestjs-dataloader';
import { Args, Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbRpcBlockLoader, CkbRpcBlockLoaderType } from '../block/block.dataloader';
import { CkbBaseBlock, CkbBlock } from '../block/block.model';
import { CkbBaseCell, CkbCell } from '../cell/cell.model';
import { CkbTransactionService } from './transaction.service';
import { CkbTransaction, CkbBaseTransaction, CkbSearchKeyInput } from './transaction.model';
import {
  CkbRpcTransactionLoader,
  CkbRpcTransactionLoaderType,
  CkbExplorerTransactionLoader,
  CkbExplorerTransactionLoaderType,
} from './transaction.dataloader';
import { BadRequestException, Logger } from '@nestjs/common';
import { CellType } from '../script/script.model';
import { CkbScriptService } from '../script/script.service';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';

@Resolver(() => CkbTransaction)
export class CkbTransactionResolver {
  private logger = new Logger(CkbTransactionResolver.name);

  constructor(
    private ckbTransactionService: CkbTransactionService,
    private ckbScriptService: CkbScriptService,
    @InjectSentry() private sentryService: SentryService,
  ) { }

  @Query(() => [CkbTransaction], { name: 'ckbLatestTransactions' })
  public async getLatestTransactions(
    @Args('types', { type: () => [CellType], nullable: true }) types: CellType[] | null,
    @Args('scriptKey', { type: () => CkbSearchKeyInput, nullable: true }) scriptKey: CkbSearchKeyInput | null,
    @Args('limit', { type: () => Float, nullable: true }) limit: number = 10,
    @Args('order', { type: () => String, nullable: true }) order: 'asc' | 'desc' = 'desc',
    @Args('after', { type: () => String, nullable: true }) after: string | null,
  ): Promise<CkbBaseTransaction[]> {
    if (types && scriptKey) {
      throw new BadRequestException('Only one of types and scriptKey can be provided');
    }

    if (types) {
      const txs = await Promise.allSettled(
        types.map(async (cellType) => {
          const service = this.ckbScriptService.getServiceByCellType(cellType);
          const txs = await service.getTransactions(limit, order, after);
          return txs;
        }),
      );
      txs.forEach((tx) => {
        if (tx.status === 'rejected') {
          this.logger.error(tx.reason);
          this.sentryService.instance().captureException(tx.reason);
        }
      });

      const orderedTxHashes = txs
        .map((tx) => (tx.status === 'fulfilled' ? tx.value.map((t) => t) : []))
        .flat()
        .sort((a, b) => {
          const sort = BI.from(b.block_number).sub(BI.from(a.block_number)).toNumber();
          return order === 'desc' ? sort : -sort;
        })
        .map((tx) => tx.tx_hash)
        .slice(0, limit);

      const orderedTxs = await Promise.all(
        orderedTxHashes.map(async (txHash) => {
          const tx = await this.ckbTransactionService.getTransactionFromRpc(txHash);
          return CkbTransaction.from(tx);
        }),
      );
      return orderedTxs;
    }

    const result = await this.ckbTransactionService.getTransactions(limit, order, scriptKey, after);
    const txs = await Promise.all(
      result.objects.map(async (tx) => {
        const txWithStatus = await this.ckbTransactionService.getTransactionFromRpc(tx.tx_hash);
        return CkbTransaction.from(txWithStatus);
      }),
    );
    return txs;
  }

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
