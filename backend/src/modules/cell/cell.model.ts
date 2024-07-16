import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { toNumber } from 'lodash';
import * as CKBExplorer from 'src/core/ckb-explorer/ckb-explorer.interface';

export type CellWithoutResolveFields = Pick<Cell, 'txHash' | 'index' | 'capacity'>;

@ObjectType({ description: 'cell' })
export class Cell {
  @Field(() => String)
  txHash: string;

  @Field(() => Int)
  index: number;

  @Field(() => Float)
  capacity: number;

  // TODO: add type script and lock script fields

  public static fromCKBExplorer(
    input: CKBExplorer.DisplayInput | CKBExplorer.DisplayOutput,
    index: number,
  ): CellWithoutResolveFields {
    return {
      index,
      txHash: input.generated_tx_hash,
      capacity: toNumber(input.capacity),
    };
  }
}
