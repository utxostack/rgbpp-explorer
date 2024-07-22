import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'CKB ChainInfo' })
export class CkbChainInfo {
  @Field(() => Float)
  tipBlockNumber: number;
}
