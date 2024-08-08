import { toNumber } from 'lodash';
import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import * as CkbRpc from 'src/core/ckb-rpc/ckb-rpc.interface';
import { CkbScript } from '../script/script.model';

@ObjectType({ description: 'CKB XUDT Info' })
export class CkbXUDTInfo {
  @Field(() => String)
  symbol: string;

  @Field(() => String)
  amount: string;

  @Field(() => Int)
  decimal: number;

  @Field(() => String)
  typeHash: string;
}

@ObjectType({ description: 'CKB Cell Status' })
export class CkbCellStatus {
  @Field(() => Boolean)
  consumed: boolean;

  @Field(() => String, { nullable: true })
  txHash: string | null;

  @Field(() => Float, { nullable: true })
  index: number | null;
}

@ObjectType({ description: 'CKB Cell' })
export class CkbCell {
  @Field(() => String)
  txHash: string;

  @Field(() => Int)
  index: number;

  @Field(() => Float)
  capacity: number;

  @Field(() => CkbScript, { nullable: true })
  type: CkbScript | null;

  @Field(() => CkbScript)
  lock: CkbScript;

  public static fromTransaction(tx: CkbRpc.Transaction, index: number): CkbCell {
    const output = tx.outputs[index];
    return {
      txHash: tx.hash,
      index,
      capacity: toNumber(output.capacity),
      type: output.type ? CkbScript.from(output.type) : null,
      lock: CkbScript.from(output.lock)!,
    };
  }

  public static fromCell(cell: CkbRpc.Cell): CkbCell {
    return {
      txHash: cell.out_point.tx_hash,
      index: toNumber(cell.out_point.index),
      capacity: toNumber(cell.output.capacity),
      type: cell.output.type ? CkbScript.from(cell.output.type) : null,
      lock: CkbScript.from(cell.output.lock)!,
    };
  }
}
