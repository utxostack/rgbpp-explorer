import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import * as BitcoinApi from 'src/core/bitcoin-api/bitcoin-api.schema';

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
  size: number;

  @Field(() => Float)
  weight: number;

  @Field(() => Float)
  bits: number;

  @Field(() => Float)
  difficulty: number;

  @Field(() => Float)
  transactionsCount: number;

  public static from(block: BitcoinApi.Block): BitcoinBlock {
    return {
      id: block.id,
      height: block.height,
      version: block.version,
      timestamp: new Date(block.timestamp),
      transactionsCount: block.tx_count,
      size: block.size,
      weight: block.weight,
      bits: block.bits,
      difficulty: block.difficulty,
    };
  }
}
