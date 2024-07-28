import { Field, ObjectType } from '@nestjs/graphql';

export type RgbppBaseStatistic = Record<string, never>;

@ObjectType({ description: 'RGB++ Coin' })
export class RgbppStatistic {
  @Field(() => Number)
  transactionsCount: number;

  @Field(() => Number)
  holdersCount: number;
}
