import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { toNumber } from 'lodash';
import * as CKBExplorer from 'src/core/ckb-explorer/ckb-explorer.interface';
import { Cell, BaseCell } from '../cell/cell.model';
import { Block } from '../block/block.model';

export type BaseTransaction = Omit<Transaction, 'block'> & {
  inputs: BaseCell[];
};

@ObjectType({ description: 'transaction' })
export class Transaction {
  @Field(() => Boolean)
  isCellbase: boolean;

  @Field(() => Int)
  blockNumber: number;

  @Field(() => String)
  hash: string;

  @Field(() => Int)
  index: number;

  @Field(() => Date)
  timestamp: Date;

  @Field(() => Float)
  outputSum: number;

  @Field(() => Float)
  fee: number;

  @Field(() => [Cell])
  inputs: Cell[];

  @Field(() => [Cell])
  outputs: Cell[];

  @Field(() => Block)
  block: Block;

  public static fromCKBExplorer(tx: CKBExplorer.Transaction): BaseTransaction {
    const outputSum = tx.display_outputs.reduce(
      (sum, output) => sum + toNumber(output.capacity),
      0,
    );
    const inputSum = tx.display_inputs.reduce((sum, input) => sum + toNumber(input.capacity), 0);
    const fee = inputSum - outputSum;

    return {
      isCellbase: tx.is_cellbase,
      blockNumber: toNumber(tx.block_number),
      hash: tx.transaction_hash,
      index: toNumber(tx.block_number),
      timestamp: new Date(toNumber(tx.block_timestamp)),
      inputs: tx.display_inputs.map((input, index) => Cell.fromCKBExplorer(input, index)),
      outputs: tx.display_outputs.map((output, index) => Cell.fromCKBExplorer(output, index)),
      outputSum,
      fee,
    };
  }
}
