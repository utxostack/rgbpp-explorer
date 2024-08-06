import { Field, Float, ObjectType } from '@nestjs/graphql';
import { CkbTransaction } from '../transaction/transaction.model';

export type CkbBaseAddress = Pick<CkbAddress, 'address'>;

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

  @Field(() => Float)
  shannon: number;

  @Field(() => Float)
  transactionsCount: number;

  @Field(() => [CkbTransaction])
  transactions: CkbTransaction[];

  @Field(() => CkbAddressBalance)
  balance: CkbAddressBalance;

  public static from(address: string): CkbBaseAddress {
    return {
      address,
    };
  }
}
