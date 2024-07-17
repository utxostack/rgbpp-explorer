import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { toNumber } from 'lodash';
import * as CKBExplorer from 'src/core/ckb-explorer/ckb-explorer.interface';
import { CkbScript } from '../script/script.model';

export type CkbBaseCell = Pick<CkbCell, 'txHash' | 'index' | 'capacity'>;

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

  public static fromCKBExplorer(
    input: CKBExplorer.DisplayInput | CKBExplorer.DisplayOutput,
    index: number,
  ): CkbBaseCell {
    return {
      index,
      txHash: input.generated_tx_hash,
      capacity: toNumber(input.capacity),
    };
  }
}
