import { Field, ObjectType } from '@nestjs/graphql';
import { BitcoinOutput } from 'src/modules/bitcoin/output/output.model';
import { CkbBaseCell, CkbCell } from 'src/modules/ckb/cell/cell.model';
import * as CkbRpc from 'src/core/ckb-rpc/ckb-rpc.interface';

export type RgbppBaseAsset = Pick<RgbppAsset, 'owner'> & {
  cell: CkbBaseCell;
};

@ObjectType({ description: 'Rgbpp Asset' })
export class RgbppAsset {
  @Field(() => String)
  owner: string;

  @Field(() => CkbCell)
  cell: CkbCell;

  @Field(() => BitcoinOutput, { nullable: true })
  utxo: BitcoinOutput | null;

  public static from(address: string, cell: CkbRpc.Cell): RgbppBaseAsset {
    return {
      owner: address,
      cell: CkbCell.fromCell(cell),
    };
  }
}
