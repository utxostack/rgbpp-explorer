import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import * as CKBExplorer from 'src/core/ckb-explorer/ckb-explorer.interface';
import { toNumber } from 'lodash';
import { Transaction } from 'src/modules/transaction/transaction.model';

export type BaseBlock = Omit<Block, 'minFee' | 'maxFee' | 'transactions'>;

@ObjectType({ description: 'block' })
export class Block {
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

  @Field(() => Int)
  size: number;

  @Field(() => Float)
  totalFee: number;

  @Field(() => Float)
  minFee: number;

  @Field(() => Float)
  maxFee: number;

  @Field(() => [Transaction])
  transactions: Transaction[];

  public static fromCKBExplorer(block: CKBExplorer.Block): BaseBlock {
    return {
      version: toNumber(block.version),
      hash: block.block_hash,
      number: toNumber(block.number),
      timestamp: new Date(toNumber(block.timestamp)),
      transactionsCount: toNumber(block.transactions_count),
      size: block.size,
      totalFee: toNumber(block.total_transaction_fee),
    };
  }
}
