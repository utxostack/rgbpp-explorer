import { BI } from '@ckb-lumos/bi';
import { Loader } from '@applifting-io/nestjs-dataloader';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import {
  CkbExplorerTransactionLoader,
  CkbExplorerTransactionLoaderType,
  CkbRpcTransactionLoader,
  CkbRpcTransactionLoaderType,
} from '../transaction/transaction.dataloader';
import { CkbCell, CkbXUDTInfo, CkbBaseCellStatus, CkbCellStatus, CkbBaseCell } from './cell.model';
import { CkbCellService } from './cell.service';

@Resolver(() => CkbCell)
export class CkbCellResolver {
  constructor(private ckbCellService: CkbCellService) { }

  @ResolveField(() => CkbXUDTInfo, { nullable: true })
  public async xudtInfo(
    @Parent() cell: CkbBaseCell,
    @Loader(CkbExplorerTransactionLoader) explorerTxLoader: CkbExplorerTransactionLoaderType,
  ): Promise<CkbXUDTInfo | null> {
    const tx = await explorerTxLoader.load(cell.txHash);
    if (!tx || !tx.display_outputs[cell.index]) {
      return null;
    }
    const output = tx.display_outputs[cell.index];
    return this.ckbCellService.getXUDTInfoFromOutput(cell, output);
  }

  @ResolveField(() => CkbCellStatus, { nullable: true })
  public async status(
    @Parent() cell: CkbBaseCell,
    @Loader(CkbRpcTransactionLoader) rpcTxLoader: CkbRpcTransactionLoaderType,
    @Loader(CkbExplorerTransactionLoader) explorerTxLoader: CkbExplorerTransactionLoaderType,
  ): Promise<CkbCellStatus | CkbBaseCellStatus | null> {
    const tx = await explorerTxLoader.load(cell.txHash);
    if (!tx || !tx.display_outputs[cell.index]) {
      return null;
    }
    const output = tx.display_outputs[cell.index];
    const consumed = output.status === 'dead';
    if (consumed) {
      const consumedTx = await rpcTxLoader.load(output.consumed_tx_hash);
      if (!consumedTx) {
        return null;
      }
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
