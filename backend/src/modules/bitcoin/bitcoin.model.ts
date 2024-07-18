import { Field, Float, ObjectType } from '@nestjs/graphql';
import * as BitcoinApi from 'src/core/bitcoin-api/bitcoin-api.schema';

export type BitcoinBaseChainInfo = Omit<BitcoinChainInfo, 'fees'>;

@ObjectType({ description: 'Bitcoin Fees' })
export class BitcoinFees {
  @Field(() => Float)
  fastest: number;

  @Field(() => Float)
  halfHour: number;

  @Field(() => Float)
  hour: number;

  @Field(() => Float)
  economy: number;

  @Field(() => Float)
  minimum: number;

  public static from(fees: BitcoinApi.RecommendedFees) {
    return {
      fastest: fees.fastestFee,
      halfHour: fees.halfHourFee,
      hour: fees.hourFee,
      economy: fees.economyFee,
      minimum: fees.minimumFee,
    };
  }
}

@ObjectType({ description: 'Bitcoin ChainInfo' })
export class BitcoinChainInfo {
  @Field(() => Float)
  tipBlockHeight: number;

  @Field(() => String)
  tipBlockHash: string;

  @Field(() => Float)
  difficulty: number;

  @Field(() => BitcoinFees)
  fees: BitcoinFees;

  public static from(info: BitcoinApi.ChainInfo) {
    return {
      tipBlockHeight: info.blocks,
      tipBlockHash: info.bestblockhash,
      difficulty: info.difficulty,
    };
  }
}
