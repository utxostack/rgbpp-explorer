import { Field, Float, ObjectType } from '@nestjs/graphql';
import { BitcoinTransaction } from '../transaction/transaction.model';

export type BitcoinBaseAddress = Pick<BitcoinAddress, 'address'>;

@ObjectType({ description: 'Bitcoin Address' })
export class BitcoinAddress {
  @Field(() => String)
  address: string;

  @Field(() => Float)
  satoshi: number;

  @Field(() => Float)
  pendingSatoshi: number;

  @Field(() => Float)
  transactionCount: number;

  @Field(() => [BitcoinTransaction])
  transactions: BitcoinTransaction[];

  public static from(address: string): BitcoinBaseAddress {
    return {
      address,
    };
  }
}
