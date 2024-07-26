import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import { CkbCell, CkbXUDTInfo } from './cell.model';

@Resolver(() => CkbCell)
export class CellResolver {
  constructor(private ckbExplorerService: CkbExplorerService) {}

  @ResolveField(() => CkbXUDTInfo)
  public async xudtInfo(@Parent() cell: CkbCell) {
    const tx = await this.ckbExplorerService.getTransaction(cell.txHash);
    return tx.data.attributes.display_outputs[cell.index].xudt_info;
  }

  @ResolveField(() => Boolean)
  public async spent(@Parent() cell: CkbCell): Promise<boolean> {
    // TODO: implement this resolver
    return false;
  }
}
