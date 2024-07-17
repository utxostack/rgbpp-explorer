import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { toNumber } from 'lodash';
import * as CKBExplorer from 'src/core/ckb-explorer/ckb-explorer.interface';
import { CkbCell, CkbBaseCell } from '../cell/cell.model';
import { CkbBlock } from '../block/block.model';

export type CkbBaseTransaction = Omit<CkbTransaction, 'block' | 'inputs' | 'outputs'> & {
  inputs: CkbBaseCell[];
  outputs: CkbBaseCell[];
};

@ObjectType({ description: 'CKB Transaction' })
export class CkbTransaction {
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

  @Field(() => [CkbCell])
  inputs: CkbCell[];

  @Field(() => [CkbCell])
  outputs: CkbCell[];

  @Field(() => CkbBlock)
  block: CkbBlock;

  public static fromCKBExplorer(tx: CKBExplorer.Transaction): CkbBaseTransaction {
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
      inputs: tx.display_inputs.map((input, index) => CkbCell.fromCKBExplorer(input, index)),
      outputs: tx.display_outputs.map((output, index) => CkbCell.fromCKBExplorer(output, index)),
      outputSum,
      fee,
    };
  }
}
