import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import * as BitcoinApi from 'src/core/bitcoin-api/bitcoin-api.schema';
import { BitcoinInput } from '../input/input.model';
import { BitcoinOutput } from '../output/output.model';

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

  public static from(tx: BitcoinApi.Transaction): BitcoinBaseTransaction {
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
