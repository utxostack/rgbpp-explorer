import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'CKB Address Balance' })
export class CkbAddressBalance {
  @Field(() => String)
  total: string;

  @Field(() => String)
  available: string;

  @Field(() => String)
  occupied: string;
}

@ObjectType({ description: 'CKB Address' })
export class CkbAddress {
  @Field(() => String)
  address: string;

  public static from(address: string): CkbAddress {
    return {
      address,
    };
  }
}
