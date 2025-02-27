import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Block, LeapDirection, Transaction } from '@prisma/client';
import { toNumber } from 'lodash';
import * as CkbExplorer from 'src/core/ckb-explorer/ckb-explorer.interface';

registerEnumType(LeapDirection, {
  name: 'LeapDirection',
});

@ObjectType({ description: 'RGB++ Transaction' })
export class RgbppTransaction {
  @Field(() => String)
  ckbTxHash: string;

  @Field(() => String, { nullable: true })
  btcTxid: string | null;

  @Field(() => Int)
  blockNumber: number;

  @Field(() => Date, { nullable: true })
  blockTime: Date | null;

  public static fromRgbppTransaction(tx: CkbExplorer.RgbppTransaction) {
    return {
      ckbTxHash: tx.tx_hash,
      btcTxid: tx.rgb_txid,
      blockNumber: tx.block_number,
      blockTime: tx.block_timestamp ? new Date(tx.block_timestamp) : null,
    };
  }

  public static fromCkbTransaction(tx: CkbExplorer.Transaction) {
    return {
      ckbTxHash: tx.transaction_hash,
      btcTxid: tx.is_rgb_transaction ? tx.rgb_txid : null,
      blockNumber: toNumber(tx.block_number),
      blockTime: tx.block_timestamp ? new Date(toNumber(tx.block_timestamp)) : null,
    };
  }

  public static from(tx: Transaction & { block: Block }) {
    return {
      ckbTxHash: tx.hash,
      btcTxid: tx.btcTxid,
      blockNumber: tx.blockNumber,
      blockTime: tx.block.timestamp ? new Date(tx.block.timestamp) : null,
    };
  }
}

@ObjectType({ description: 'RGB++ latest transaction list' })
export class RgbppLatestTransactionList {
  @Field(() => [RgbppTransaction])
  txs: RgbppTransaction[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  pageSize: number;
}
