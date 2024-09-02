import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'RGB++ Statistic' })
export class RgbppStatistic {}

@ObjectType({ description: 'RGB++ Holder' })
export class RgbppHolder {
  @Field(() => String)
  address: string;

  @Field(() => Int)
  assetCount: number;
}
