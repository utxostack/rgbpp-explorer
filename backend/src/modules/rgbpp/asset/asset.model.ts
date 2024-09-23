import { Field, ObjectType } from '@nestjs/graphql';
import { CkbCell } from 'src/modules/ckb/cell/cell.model';
import * as CkbRpc from 'src/core/ckb-rpc/ckb-rpc.interface';

@ObjectType({ description: 'Rgbpp Asset' })
export class RgbppAsset {
  @Field(() => String)
  owner: string;

  @Field(() => CkbCell)
  cell: CkbCell;

  public static fromCell(address: string, cell: CkbRpc.Cell): RgbppAsset {
    return {
      owner: address,
      cell: CkbCell.fromCell(cell),
    };
  }

  public static fromTransaction(
    address: string,
    tx: CkbRpc.Transaction,
    index: number,
  ): RgbppAsset {
    return {
      owner: address,
      cell: CkbCell.fromTransaction(tx, index),
    };
  }
}
