import { toNumber } from 'lodash';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import * as CkbRpc from 'src/core/ckb-rpc/ckb-rpc.interface';

@ObjectType({ description: 'CKB Block' })
export class CkbBlock {
  @Field(() => Int)
  version: number;

  @Field(() => String)
  hash: string;

  @Field(() => Int)
  number: number;

  @Field(() => Date)
  timestamp: Date;

  @Field(() => Int)
  transactionsCount: number;

  public static from(block: CkbRpc.Block): CkbBlock {
    return {
      version: toNumber(block.header.version),
      hash: block.header.hash,
      number: toNumber(block.header.number),
      timestamp: new Date(toNumber(block.header.timestamp)),
      transactionsCount: block.transactions.length,
    };
  }
}
