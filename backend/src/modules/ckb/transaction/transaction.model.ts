import { toNumber } from 'lodash';
import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import * as CkbRpc from 'src/core/ckb-rpc/ckb-rpc.interface';
import { CkbBaseCell, CkbCell } from '../cell/cell.model';
import { CkbBlock } from '../block/block.model';

export type CkbBaseTransaction = Omit<
  CkbTransaction,
  'block' | 'feeRate' | 'size' | 'inputs' | 'confirmations'
>;

@ObjectType({ description: 'CKB Transaction' })
export class CkbTransaction {
  @Field(() => Boolean)
  isCellbase: boolean;

  @Field(() => Int)
  blockNumber: number;

  @Field(() => String)
  hash: string;

  @Field(() => Float)
  fee: number;

  @Field(() => Float)
  feeRate: number;

  @Field(() => Float)
  size: number;

  @Field(() => [CkbCell])
  inputs: CkbBaseCell[];

  @Field(() => [CkbCell])
  outputs: CkbBaseCell[];

  @Field(() => CkbBlock)
  block: CkbBlock;

  @Field(() => Float)
  confirmations: number;

  public static from(transactionWithStatus: CkbRpc.TransactionWithStatusResponse) {
    const { transaction, tx_status, fee } = transactionWithStatus;
    const isCellbase = transaction.inputs[0].previous_output.tx_hash.endsWith('0'.repeat(64));

    return {
      isCellbase,
      hash: transaction.hash,
      blockNumber: toNumber(tx_status.block_number),
      fee: toNumber(fee),
      outputs: transaction.outputs.map((_, index) => CkbCell.from(transaction, index)),
    };
  }
}
