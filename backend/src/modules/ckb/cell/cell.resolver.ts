import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbCell, CkbXUDTInfo } from './cell.model';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';

@Resolver(() => CkbCell)
export class CellResolver {
  constructor(private ckbExplorerService: CkbExplorerService) {}

  @ResolveField(() => CkbXUDTInfo)
  public async xudtInfo(@Parent() cell: CkbCell) {
    const tx = await this.ckbExplorerService.getTransaction(cell.txHash);
    return tx.data.attributes.display_outputs[cell.index].xudt_info;
  }
}
