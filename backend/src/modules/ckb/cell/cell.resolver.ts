import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbBaseCell, CkbCell } from './cell.model';
import { CkbScript } from '../script/script.model';
import { CkbTransactionLoader, CkbTransactionLoaderResponse } from '../transaction/transaction.dataloader';
import { Loader } from '@applifting-io/nestjs-dataloader';
import DataLoader from 'dataloader';

@Resolver(() => CkbCell)
export class CellResolver {
  @ResolveField(() => CkbScript)
  public async type(
    @Parent() cell: CkbBaseCell,
    @Loader(CkbTransactionLoader)
    txLoader: DataLoader<string, CkbTransactionLoaderResponse>,
  ): Promise<CkbScript> {
    const tx = await txLoader.load(cell.txHash);
    const output = tx.transaction.outputs[cell.index];
    // XXX: not sure why output will get null
    if (!output) return null;
    return output.type ? CkbScript.fromCKBRpc(output.type) : null;
  }

  @ResolveField(() => CkbScript)
  public async lock(
    @Parent() cell: CkbBaseCell,
    @Loader(CkbTransactionLoader)
    txLoader: DataLoader<string, CkbTransactionLoaderResponse>,
  ): Promise<CkbScript> {
    const tx = await txLoader.load(cell.txHash);
    const output = tx.transaction.outputs[cell.index];
    // XXX: not sure why output will get null
    if (!output) return null;
    return CkbScript.fromCKBRpc(output.lock);
  }
}
