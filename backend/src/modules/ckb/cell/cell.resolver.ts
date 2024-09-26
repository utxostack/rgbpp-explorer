import { BI } from '@ckb-lumos/bi';
import { Loader } from 'src/common/dataloader';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import {
  CkbExplorerTransactionLoader,
  CkbExplorerTransactionLoaderType,
  CkbRpcTransactionLoader,
  CkbRpcTransactionLoaderType,
} from '../transaction/transaction.dataloader';
import { CkbCell, CkbXUDTInfo, CkbCellStatus } from './cell.model';
import { CkbCellService } from './cell.service';
import { CellType } from '../script/script.model';
import { CkbScriptService } from '../script/script.service';
import { ComplexityType } from 'src/modules/complexity.plugin';

@Resolver(() => CkbCell)
export class CkbCellResolver {
  constructor(
    private ckbCellService: CkbCellService,
    private ckbScriptService: CkbScriptService,
  ) { }

  @ResolveField(() => CkbXUDTInfo, { nullable: true, complexity: ComplexityType.RequestField })
  public async xudtInfo(
    @Parent() cell: CkbCell,
    @Loader(CkbExplorerTransactionLoader) explorerTxLoader: CkbExplorerTransactionLoaderType,
  ): Promise<CkbXUDTInfo | null> {
    const tx = await explorerTxLoader.load(cell.txHash);
    if (!tx || !tx.display_outputs[cell.index]) {
      return null;
    }
    const output = tx.display_outputs[cell.index];
    return this.ckbCellService.getXUDTInfoFromOutput(cell, output);
  }

  @ResolveField(() => CkbCellStatus, { nullable: true, complexity: ComplexityType.RequestField })
  public async status(
    @Parent() cell: CkbCell,
    @Loader(CkbRpcTransactionLoader) rpcTxLoader: CkbRpcTransactionLoaderType,
    @Loader(CkbExplorerTransactionLoader) explorerTxLoader: CkbExplorerTransactionLoaderType,
  ): Promise<CkbCellStatus | CkbCellStatus | null> {
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
        txHash: null,
        index: null,
      };
    }
  }

  @ResolveField(() => CellType, { nullable: true })
  public cellType(@Parent() cell: CkbCell) {
    if (!cell.type) {
      return null;
    }
    try {
      const cellType = this.ckbScriptService.getCellTypeByScript(cell.type);
      return cellType;
    } catch {
      return null;
    }
  }
}
