import { Field, Float, ObjectType } from '@nestjs/graphql';
import * as BitcoinApi from 'src/core/bitcoin-api/bitcoin-api.schema';
import { BitcoinAddress, BitcoinBaseAddress } from '../address/address.model';

export type BitcoinBaseOutput = BitcoinOutput;

@ObjectType({ description: 'Bitcoin Output' })
export class BitcoinOutput {
  @Field(() => String)
  scriptpubkey: string;

  @Field(() => String)
  scriptpubkeyAsm: string;

  @Field(() => String)
  scriptpubkeyType: string;

  @Field(() => String, { nullable: true })
  scriptpubkeyAddress: string;

  @Field(() => Float)
  value: number;

  @Field(() => BitcoinAddress, { nullable: true })
  address: BitcoinBaseAddress;

  public static from(output: BitcoinApi.Output): BitcoinBaseOutput {
    return {
      scriptpubkey: output.scriptpubkey,
      scriptpubkeyAsm: output.scriptpubkey_asm,
      scriptpubkeyType: output.scriptpubkey_type,
      scriptpubkeyAddress: output.scriptpubkey_address,
      value: output.value,
      address: output.scriptpubkey_address
        ? BitcoinAddress.from(output.scriptpubkey_address)
        : null,
    };
  }
}
