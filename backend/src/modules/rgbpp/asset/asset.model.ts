import { Field, ObjectType } from '@nestjs/graphql';
import { CkbCell } from 'src/modules/ckb/cell/cell.model';
import * as CkbRpc from 'src/core/ckb-rpc/ckb-rpc.interface';

@ObjectType({ description: 'Rgbpp Asset' })
export class RgbppAsset {
  @Field(() => String)
  owner: string;

  @Field(() => CkbCell)
  cell: CkbCell;

  public static from(address: string, cell: CkbRpc.Cell): RgbppAsset {
    return {
      owner: address,
      cell: CkbCell.fromCell(cell),
    };
  }
}
