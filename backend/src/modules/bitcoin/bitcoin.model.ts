import { Field, Float, ObjectType } from '@nestjs/graphql';
import * as BitcoinApi from 'src/core/bitcoin-api/bitcoin-api.schema';

@ObjectType({ description: 'Bitcoin ChainInfo' })
export class BitcoinChainInfo {
  @Field(() => Float)
  tipBlockHeight: number;

  @Field(() => String)
  tipBlockHash: string;

  @Field(() => Float)
  difficulty: number;

  public static from(info: BitcoinApi.ChainInfo) {
    return {
      tipBlockHeight: info.blocks,
      tipBlockHash: info.bestblockhash,
      difficulty: info.difficulty,
    };
  }
}
