import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import * as BitcoinApi from 'src/core/bitcoin-api/bitcoin-api.schema';
import { BitcoinBaseOutput, BitcoinOutput } from '../output/output.model';
import { BitcoinInput } from '../input/input.model';
import { RgbppTransaction } from 'src/modules/rgbpp/transaction/transaction.model';
import { BitcoinBlock } from '../block/block.model';

export type BitcoinBaseTransaction = Omit<
  BitcoinTransaction,
  'confirmations' | 'block' | 'rgbppTransaction' | 'transactionTime'
>;

@ObjectType({ description: 'Bitcoin Transaction' })
export class BitcoinTransaction {
  @Field(() => Float, { nullable: true })
  blockHeight: number | null;

  @Field(() => String, { nullable: true })
  blockHash: string | null;

  @Field(() => Date, { nullable: true })
  blockTime: Date | null;

  @Field(() => String)
  txid: string;

  @Field(() => Int)
  version: number;

  @Field(() => [BitcoinInput], { nullable: true })
  vin: BitcoinInput[];

  @Field(() => [BitcoinOutput])
  vout: BitcoinBaseOutput[];

  @Field(() => Float)
  size: number;

  @Field(() => Float)
  locktime: number;

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

  @Field(() => Date)
  transactionTime: Date;

  @Field(() => BitcoinBlock)
  block: BitcoinBlock;

  @Field(() => RgbppTransaction, { nullable: true })
  rgbppTransaction?: RgbppTransaction;

  public static from(tx: BitcoinApi.Transaction): BitcoinBaseTransaction {
    const vSize = Math.ceil(tx.weight / 4);

    return {
      blockHeight: tx.status.block_height ?? null,
      blockHash: tx.status.block_hash ?? null,
      blockTime: tx.status.block_time ? new Date(tx.status.block_time * 1000) : null,
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
      locktime: tx.locktime,
      weight: tx.weight,
      fee: tx.fee,
      feeRate: tx.fee / vSize,
      confirmed: tx.status.confirmed,
    };
  }
}
