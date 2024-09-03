import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum Layer {
  L1 = 'L1',
  L2 = 'L2',
}

registerEnumType(Layer, {
  name: 'Layer',
});

@ObjectType({ description: 'RGB++ Statistic' })
export class RgbppStatistic { }

@ObjectType({ description: 'RGB++ Holder' })
export class RgbppHolder {
  @Field(() => String)
  address: string;

  @Field(() => Int)
  assetCount: number;

  @Field(() => String, { nullable: true })
  assetAmount: string;
}
