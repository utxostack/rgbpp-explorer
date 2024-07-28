import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'CKB Fees' })
export class CkbFees {
  @Field(() => Float)
  fast: number;

  @Field(() => Float)
  slow: number;

  @Field(() => Float)
  average: number;
}

export type CkbBaseChainInfo = Omit<CkbChainInfo, 'fees' | 'txCountIn24Hours'>;

@ObjectType({ description: 'CKB ChainInfo' })
export class CkbChainInfo {
  @Field(() => Float)
  tipBlockNumber: number;

  @Field(() => Float)
  txCountIn24Hours: number;

  @Field(() => CkbFees)
  fees: CkbFees;
}
