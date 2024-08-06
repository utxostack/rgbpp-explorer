import { Field, ObjectType } from '@nestjs/graphql';

export type RgbppBaseStatistic = Record<string, never>;

@ObjectType({ description: 'RGB++ Statistic' })
export class RgbppStatistic {
  @Field(() => Number)
  transactionsCount: number;

  @Field(() => Number)
  holdersCount: number;

  @Field(() => Number)
  latest24HoursL1TransactionsCount: number;

  @Field(() => Number)
  latest24HoursL2TransactionsCount: number;
}
