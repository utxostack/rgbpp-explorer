import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Rgbpp Address' })
export class RgbppAddress {
  @Field(() => String)
  address: string;

  public static from(address: string): RgbppAddress {
    return {
      address,
    };
  }
}
