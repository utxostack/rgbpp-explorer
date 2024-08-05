import { Field, Float, ObjectType } from '@nestjs/graphql';
import * as BitcoinApi from 'src/core/bitcoin-api/bitcoin-api.schema';
import { BitcoinAddress, BitcoinBaseAddress } from '../address/address.model';

export interface BitcoinOutputWithSource extends BitcoinApi.Output {
  txid: string;
  vout: number;
}

@ObjectType({ description: 'Bitcoin Output Spend Status' })
export class BitcoinOutputStatus {
  @Field(() => Boolean)
  spent: boolean;

  @Field(() => String, { nullable: true })
  txid: string | null;

  @Field(() => Float, { nullable: true })
  vin: number | null;

  public static from(outSpend: BitcoinApi.OutSpend): BitcoinOutputStatus {
    return {
      spent: outSpend.spent,
      txid: outSpend.spent ? outSpend.txid : null,
      vin: outSpend.spent ? outSpend.vin : null,
    };
  }
}

export type BitcoinBaseOutput = Omit<BitcoinOutput, 'status'>;

@ObjectType({ description: 'Bitcoin Output' })
export class BitcoinOutput {
  @Field(() => String)
  txid: string;

  @Field(() => Float)
  vout: number;

  @Field(() => String)
  scriptpubkey: string;

  @Field(() => String)
  scriptpubkeyAsm: string;

  @Field(() => String)
  scriptpubkeyType: string;

  @Field(() => String, { nullable: true })
  scriptpubkeyAddress: string | null;

  @Field(() => Float)
  value: number;

  @Field(() => BitcoinAddress, { nullable: true })
  address: BitcoinBaseAddress | null;

  @Field(() => BitcoinOutputStatus)
  status: BitcoinOutputStatus;

  public static from(output: BitcoinOutputWithSource): BitcoinBaseOutput {
    return {
      txid: output.txid,
      vout: output.vout,
      scriptpubkey: output.scriptpubkey,
      scriptpubkeyAsm: output.scriptpubkey_asm,
      scriptpubkeyType: output.scriptpubkey_type,
      scriptpubkeyAddress: output.scriptpubkey_address ?? null,
      value: output.value,
      address: output.scriptpubkey_address
        ? BitcoinAddress.from(output.scriptpubkey_address)
        : null,
    };
  }
}
