import { BI } from '@ckb-lumos/bi';
import { Loader } from '@applifting-io/nestjs-dataloader';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import {
  CkbExplorerTransactionLoader,
  CkbExplorerTransactionLoaderType,
  CkbRpcTransactionLoader,
  CkbRpcTransactionLoaderType,
} from '../transaction/transaction.dataloader';
import { CkbCell, CkbXUDTInfo, CkbBaseCellStatus, CkbCellStatus } from './cell.model';

@Resolver(() => CkbCell)
export class CkbCellResolver {
  @ResolveField(() => CkbXUDTInfo)
  public async xudtInfo(
    @Parent() cell: CkbCell,
    @Loader(CkbExplorerTransactionLoader) explorerTxLoader: CkbExplorerTransactionLoaderType,
  ) {
    const tx = await explorerTxLoader.load(cell.txHash);
    return tx.display_outputs[cell.index].xudt_info;
  }

  @ResolveField(() => CkbCellStatus)
  public async status(
    @Parent() cell: CkbCell,
    @Loader(CkbRpcTransactionLoader) rpcTxLoader: CkbRpcTransactionLoaderType,
    @Loader(CkbExplorerTransactionLoader) explorerTxLoader: CkbExplorerTransactionLoaderType,
  ): Promise<CkbCellStatus | CkbBaseCellStatus> {
    const tx = await explorerTxLoader.load(cell.txHash);
    const output = tx.display_outputs[cell.index];
    const consumed = output.status === 'dead';
    if (consumed) {
      const consumedTx = await rpcTxLoader.load(output.consumed_tx_hash);
      const index = consumedTx.transaction.inputs.findIndex(
        (input) =>
          input.previous_output.tx_hash === cell.txHash &&
          BI.from(input.previous_output.index).toNumber() === cell.index,
      );
      return {
        consumed,
        txHash: output.consumed_tx_hash,
        index,
      };
    } else {
      return {
        consumed,
      };
    }
  }
}
