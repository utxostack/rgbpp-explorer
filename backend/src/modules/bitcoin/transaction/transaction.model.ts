import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import * as BitcoinApi from 'src/core/bitcoin-api/bitcoin-api.schema';
import { BitcoinBaseOutput, BitcoinOutput } from '../output/output.model';
import { BitcoinInput } from '../input/input.model';

export type BitcoinBaseTransaction = Omit<BitcoinTransaction, 'confirmations'>;

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
  vout: BitcoinBaseOutput[];

  @Field(() => Float)
  size: number;

  @Field(() => Date)
  locktime: Date;

  @Field(() => Float)
  weight: number;

  @Field(() => Float)
  fee: number;

  @Field(() => Float)
  feeRate: number;

  @Field(() => Boolean)
  confirmed: boolean;

  @Field(() => Float)
  confirmations: number;

  public static from(tx: BitcoinApi.Transaction): BitcoinBaseTransaction {
    const vSize = Math.ceil(tx.weight / 4);

    return {
      blockHeight: tx.status.block_height,
      blockHash: tx.status.block_hash,
      txid: tx.txid,
      version: tx.version,
      vin: tx.vin.map(BitcoinInput.from),
      vout: tx.vout.map((output, index) =>
        BitcoinOutput.from({
          txid: tx.txid,
          vout: index,
          ...output,
        }),
      ),
      size: tx.size,
      locktime: new Date(tx.locktime),
      weight: tx.weight,
      fee: tx.fee,
      feeRate: tx.fee / vSize,
      confirmed: tx.status.confirmed,
    };
  }
}
