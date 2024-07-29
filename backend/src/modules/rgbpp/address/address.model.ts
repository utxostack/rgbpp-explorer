import { Field, Float, ObjectType } from '@nestjs/graphql';

export type RgbppBaseAddress = Pick<RgbppAddress, 'address'>;

@ObjectType({ description: 'Rgbpp Address' })
export class RgbppAddress {
  @Field(() => String)
  address: string;

  @Field(() => Float)
  utxosCount: number;

  @Field(() => Float)
  cellsCount: number;

  public static from(address: string): RgbppBaseAddress {
    return {
      address,
    };
  }
}
