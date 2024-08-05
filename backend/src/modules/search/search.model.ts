import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Search Result (including address/tx/block)' })
export class SearchResult {
  @Field(() => String)
  query: string;

  @Field(() => String, { nullable: true })
  btcBlock: string | null;

  @Field(() => String, { nullable: true })
  btcTransaction: string | null;

  @Field(() => String, { nullable: true })
  btcAddress: string | null;

  @Field(() => String, { nullable: true })
  ckbBlock: string | null;

  @Field(() => String, { nullable: true })
  ckbTransaction: string | null;

  @Field(() => String, { nullable: true })
  ckbAddress: string | null;

  @Field(() => String, { nullable: true })
  rgbppCoin: string | null;
}
