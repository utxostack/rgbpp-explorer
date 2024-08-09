import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Bitcoin Address' })
export class BitcoinAddress {
  @Field(() => String)
  address: string;

  public static from(address: string): BitcoinAddress {
    return {
      address,
    };
  }
}
