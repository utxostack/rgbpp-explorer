import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import * as BitcoinApi from 'src/core/bitcoin-api/bitcoin-api.schema';
import { BitcoinAddress } from '../address/address.model';
import { BitcoinTransaction } from '../transaction/transaction.model';

export type BitcoinBaseBlock = Omit<BitcoinBlock, 'miner' | 'totalFee' | 'feeRateRange' | 'transactions'>;

@ObjectType({ description: 'Fee Rate Range' })
export class FeeRateRange {
  @Field(() => Float)
  min: number;

  @Field(() => Float)
  max: number;
}

@ObjectType({ description: 'Bitcoin Block' })
export class BitcoinBlock {
  @Field(() => String)
  id: string;

  @Field(() => Float)
  height: number;

  @Field(() => Int)
  version: number;

  @Field(() => Date)
  timestamp: Date;

  @Field(() => Float)
  txCount: number;

  @Field(() => Float)
  size: number;

  @Field(() => Float)
  weight: number;

  @Field(() => Float)
  bits: number;

  @Field(() => Float)
  difficulty: number;

  @Field(() => BitcoinAddress)
  miner: BitcoinAddress;

  @Field(() => Float)
  totalFee: number;

  @Field(() => FeeRateRange)
  feeRateRange: FeeRateRange;

  @Field(() => [BitcoinTransaction])
  transactions: BitcoinTransaction[];

  public static from(block: BitcoinApi.Block): BitcoinBaseBlock {
    return {
      id: block.id,
      height: block.height,
      version: block.version,
      timestamp: new Date(block.timestamp),
      txCount: block.tx_count,
      size: block.size,
      weight: block.weight,
      bits: block.bits,
      difficulty: block.difficulty,
    };
  }
}
