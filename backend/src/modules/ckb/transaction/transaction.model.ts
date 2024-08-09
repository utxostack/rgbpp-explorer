import { toNumber } from 'lodash';
import { Field, Float, InputType, ObjectType } from '@nestjs/graphql';
import { ResultFormatter, RPCTypes } from '@ckb-lumos/lumos/rpc';
import { blockchain } from '@ckb-lumos/lumos/codec';
import * as CkbRpc from 'src/core/ckb-rpc/ckb-rpc.interface';
import { CkbCell } from '../cell/cell.model';
import { CkbScriptInput } from '../script/script.model';

@InputType({ description: 'Search key for CKB transactions' })
export class CkbSearchKeyInput {
  @Field(() => CkbScriptInput)
  script: CkbScriptInput;

  @Field(() => String)
  scriptType: 'lock' | 'type';
}

@ObjectType({ description: 'CKB Transaction' })
export class CkbTransaction {
  @Field(() => Boolean)
  isCellbase: boolean;

  @Field(() => Float)
  blockNumber: number;

  @Field(() => String)
  hash: string;

  @Field(() => Float)
  size: number;

  @Field(() => [CkbCell])
  outputs: CkbCell[];

  @Field(() => Boolean)
  confirmed: boolean;

  public static from(
    transactionWithStatus: CkbRpc.TransactionWithStatusResponse,
  ): CkbTransaction | null {
    const { transaction, tx_status } = transactionWithStatus;
    if (!transaction || tx_status?.status === 'unknown') {
      return null;
    }

    const isCellbase = transaction.inputs[0].previous_output.tx_hash.endsWith('0'.repeat(64));

    const resultTx = ResultFormatter.toTransaction(transaction as RPCTypes.Transaction);
    const binaryTx = blockchain.Transaction.pack(resultTx);
    const txBytes = binaryTx.byteLength;

    return {
      isCellbase,
      hash: transaction.hash,
      confirmed: tx_status.status === 'committed',
      blockNumber: toNumber(tx_status.block_number),
      outputs: transaction.outputs.map((_, index) => CkbCell.fromTransaction(transaction, index)),
      size: txBytes,
    };
  }
}
