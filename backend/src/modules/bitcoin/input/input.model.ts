import { Field, Float, ObjectType } from '@nestjs/graphql';
import * as BitcoinApi from 'src/core/bitcoin-api/bitcoin-api.schema';
import { BitcoinBaseOutput, BitcoinOutput } from '../output/output.model';

@ObjectType({ description: 'Bitcoin Input' })
export class BitcoinInput {
  @Field(() => String)
  txid: string;

  @Field(() => Float)
  vout: number;

  @Field(() => BitcoinOutput, { nullable: true })
  prevout: BitcoinBaseOutput;

  @Field(() => String)
  scriptsig: string;

  @Field(() => String)
  scriptsigAsm: string;

  @Field(() => Boolean)
  isCoinbase: boolean;

  @Field(() => Float)
  sequence: number;

  public static from(input: BitcoinApi.Input) {
    return {
      txid: input.txid,
      vout: input.vout,
      prevout: input.prevout ? BitcoinOutput.from(input.prevout) : null,
      scriptsig: input.scriptsig,
      scriptsigAsm: input.scriptsig_asm,
      isCoinbase: input.is_coinbase,
      sequence: input.sequence,
    };
  }
}
