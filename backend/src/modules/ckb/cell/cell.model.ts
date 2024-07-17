import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { toNumber } from 'lodash';
import * as CkbRpc from 'src/core/ckb-rpc/ckb-rpc.interface';
import { CkbScript } from '../script/script.model';

export type CkbBaseCell = CkbCell;

@ObjectType({ description: 'CKB Cell' })
export class CkbCell {
  @Field(() => String)
  txHash: string;

  @Field(() => Int)
  index: number;

  @Field(() => Float)
  capacity: number;

  @Field(() => CkbScript, { nullable: true })
  type: CkbScript;

  @Field(() => CkbScript)
  lock: CkbScript;

  public static from(tx: CkbRpc.Transaction, index: number): CkbBaseCell {
    const output = tx.outputs[index];
    return {
      txHash: tx.hash,
      index,
      capacity: toNumber(output.capacity),
      type: output.type ? CkbScript.from(output.type) : null,
      lock: CkbScript.from(output.lock),
    }
  }
}
