import { Field, Float, ObjectType } from '@nestjs/graphql';

export type RgbppBaseStatistic = Record<string, never>;

@ObjectType({ description: 'RGB++ Statistic' })
export class RgbppStatistic {
  @Field(() => Float)
  transactionsCount: number;

  @Field(() => Float)
  holdersCount: number;

  @Field(() => Float)
  latest24HoursL1TransactionsCount: number;

  @Field(() => Float)
  latest24HoursL2TransactionsCount: number;
}
