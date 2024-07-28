import { Field, Float, ObjectType } from '@nestjs/graphql';
import { CkbTransaction } from '../transaction/transaction.model';

export type CkbBaseAddress = Pick<CkbAddress, 'address'>;

@ObjectType({ description: 'CKB Address' })
export class CkbAddress {
  @Field(() => String)
  address: string;

  @Field(() => Float)
  shannon: number;

  @Field(() => Float)
  rgbppCellCount: number;

  @Field(() => Float)
  transactionCount: number;

  @Field(() => [CkbTransaction])
  transactions: CkbTransaction[];

  public static from(address: string): CkbBaseAddress {
    return {
      address,
    };
  }
}
