import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { toNumber } from 'lodash';
import * as CkbRpc from 'src/core/ckb-rpc/ckb-rpc.interface';
import { CkbCell } from '../cell/cell.model';
import { CkbBlock } from '../block/block.model';
import { BI } from '@ckb-lumos/bi';

export type CkbBaseTransaction = Omit<CkbTransaction, 'fee' | 'block' | 'inputs'>;

@ObjectType({ description: 'CKB Transaction' })
export class CkbTransaction {
  @Field(() => Boolean)
  isCellbase: boolean;

  @Field(() => Int)
  blockNumber: number;

  @Field(() => String)
  hash: string;

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

  public static from(block: CkbRpc.Block, tx: CkbRpc.Transaction) {
    const isCellbase = tx.inputs[0].previous_output.tx_hash.endsWith('0'.repeat(64));
    const outputSum = tx.outputs.reduce(
      (sum, output) => sum + BI.from(output.capacity).toNumber(),
      0,
    );

    return {
      isCellbase,
      hash: tx.hash,
      blockNumber: toNumber(block.header.number),
      timestamp: new Date(BI.from(block.header.timestamp).toNumber()),
      outputSum,
      outputs: tx.outputs.map((_, index) => CkbCell.from(tx, index)),
    };
  }
}
