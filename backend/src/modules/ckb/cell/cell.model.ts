import { toNumber } from 'lodash';
import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import * as CkbRpc from 'src/core/ckb-rpc/ckb-rpc.interface';
import { CkbScript } from '../script/script.model';

@ObjectType({ description: 'CKB XUDT Info' })
export class CkbXUDTInfo {
  @Field(() => String)
  symbol: string;

  @Field(() => Float)
  amount: number;

  @Field(() => Int)
  decimal: number;

  @Field(() => String)
  typeHash: string;
}

export type CkbBaseCell = Omit<CkbCell, 'xudtInfo'>;

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

  @Field(() => CkbXUDTInfo, { nullable: true })
  xudtInfo: CkbXUDTInfo;

  public static from(tx: CkbRpc.Transaction, index: number): CkbBaseCell {
    const output = tx.outputs[index];
    return {
      txHash: tx.hash,
      index,
      capacity: toNumber(output.capacity),
      type: output.type ? CkbScript.from(output.type) : null,
      lock: CkbScript.from(output.lock),
    };
  }
}
