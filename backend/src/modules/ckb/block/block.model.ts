import { toNumber } from 'lodash';
import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import * as CkbRpc from 'src/core/ckb-rpc/ckb-rpc.interface';
import { CkbAddress } from '../address/address.model';
import { CkbTransaction } from '../transaction/transaction.model';

export type CkbBaseBlock = Omit<
  CkbBlock,
  'totalFee' | 'feeRateRange' | 'miner' | 'reward' | 'transactions' | 'size' | 'confirmations'
>;

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

  @Field(() => Float)
  totalFee: number;

  @Field(() => CkbAddress)
  miner: CkbAddress;

  @Field(() => Float)
  reward: number;

  @Field(() => [CkbTransaction])
  transactions: CkbTransaction[];

  @Field(() => Float, { nullable: true })
  size: number | null;

  @Field(() => Float, { nullable: true })
  confirmations: number | null;

  public static from(block: CkbRpc.Block): CkbBaseBlock {
    return {
      version: toNumber(block.header.version),
      hash: block.header.hash,
      number: toNumber(block.header.number),
      timestamp: new Date(toNumber(block.header.timestamp)),
      transactionsCount: block.transactions.length,
    };
  }
}
