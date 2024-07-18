import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import * as BitcoinApi from 'src/core/bitcoin-api/bitcoin-api.schema';

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

  public static from(output: BitcoinApi.Output) {
    return {
      scriptpubkey: output.scriptpubkey,
      scriptpubkeyAsm: output.scriptpubkey_asm,
      scriptpubkeyType: output.scriptpubkey_type,
      scriptpubkeyAddress: output.scriptpubkey_address,
      value: output.value,
    };
  }
}

@ObjectType({ description: 'Bitcoin Input' })
export class BitcoinInput {
  @Field(() => String)
  txid: string;

  @Field(() => Int)
  vout: number;

  @Field(() => BitcoinOutput, { nullable: true })
  prevout: BitcoinOutput;

  @Field(() => String)
  scriptsig: string;

  @Field(() => String)
  scriptsigAsm: string;

  @Field(() => Boolean)
  isCoinbase: boolean;

  @Field(() => Int)
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

export type BitcoinBaseTransaction = BitcoinTransaction;

@ObjectType({ description: 'Bitcoin Transaction' })
export class BitcoinTransaction {
  @Field(() => Float)
  blockHeight: number;

  @Field(() => String)
  blockHash: string;

  @Field(() => String)
  txid: string;

  @Field(() => Int)
  version: number;

  @Field(() => [BitcoinInput])
  vin: BitcoinInput[];

  @Field(() => [BitcoinOutput])
  vout: BitcoinOutput[];

  @Field(() => Float)
  size: number;

  @Field(() => Date)
  locktime: Date;

  @Field(() => Float)
  weight: number;

  @Field(() => Float)
  fee: number;

  @Field(() => Boolean)
  confirmed: boolean;

  public static from(tx: BitcoinApi.Transaction) {
    if (!tx) {
      return null;
    }

    return {
      blockHeight: tx.status.block_height,
      blockHash: tx.status.block_hash,
      txid: tx.txid,
      version: tx.version,
      vin: tx.vin.map(BitcoinInput.from),
      vout: tx.vout.map(BitcoinOutput.from),
      size: tx.size,
      locktime: new Date(tx.locktime),
      weight: tx.weight,
      fee: tx.fee,
      confirmed: tx.status.confirmed,
    };
  }
}
