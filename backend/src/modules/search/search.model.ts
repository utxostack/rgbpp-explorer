import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType({ description: 'Search Result (including address/tx/block)' })
export class SearchResult {
  @Field(() => String)
  query: string;

  @Field(() => String, { nullable: true })
  btcBlock: string;

  @Field(() => String, { nullable: true })
  btcTransaction: string;

  @Field(() => String, { nullable: true })
  btcAddress: string;

  @Field(() => String, { nullable: true })
  ckbBlock: string;

  @Field(() => String, { nullable: true })
  ckbTransaction: string;

  @Field(() => String, { nullable: true })
  ckAddress: string;
}
