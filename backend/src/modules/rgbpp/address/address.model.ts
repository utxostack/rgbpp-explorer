import { Field, Float, ObjectType } from '@nestjs/graphql';
import { RgbppAsset } from '../asset/asset.model';
import { CkbXUDTInfo } from 'src/modules/ckb/cell/cell.model';

export type RgbppBaseAddress = Pick<RgbppAddress, 'address'>;

@ObjectType({ description: 'Rgbpp Address' })
export class RgbppAddress {
  @Field(() => String)
  address: string;

  @Field(() => Float)
  utxosCount: number;

  @Field(() => Float)
  cellsCount: number;

  @Field(() => [RgbppAsset])
  assets: RgbppAsset[];

  @Field(() => [CkbXUDTInfo])
  balances: CkbXUDTInfo[];

  public static from(address: string): RgbppBaseAddress {
    return {
      address,
    };
  }
}
