import { Field, Float, ObjectType } from '@nestjs/graphql';
import * as BitcoinApi from 'src/core/bitcoin-api/bitcoin-api.schema';

@ObjectType({ description: 'Bitcoin Output Spend Status' })
export class BitcoinOutputSpend {
  @Field(() => Boolean)
  spent: boolean;

  @Field(() => String, { nullable: true })
  txid: string;

  @Field(() => Float, { nullable: true })
  vin: number;

  public static from(outSpend: BitcoinApi.OutSpend): BitcoinOutputSpend {
    return {
      spent: outSpend.spent,
      txid: outSpend.spent ? outSpend.txid : null,
      vin: outSpend.spent ? outSpend.vin : null,
    };
  }
}
