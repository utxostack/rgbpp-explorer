import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { toNumber } from 'lodash';
import * as CkbExplorer from 'src/core/ckb-explorer/ckb-explorer.interface';
import { BitcoinTransaction } from 'src/modules/bitcoin/transaction/transaction.model';
import { CkbTransaction } from 'src/modules/ckb/transaction/transaction.model';

export type RgbppBaseTransaction = Omit<
  RgbppTransaction,
  'ckbTransaction' | 'btcTransaction' | 'leapDirection'
>;

// XXX: ts-graphql uses enum keys as values in GQL: https://typegraphql.com/docs/enums.html#interoperability
export enum LeapDirection {
  LeapIn = 'leap_in',
  LeapOut = 'leap_out',
  Within = 'within',
}

export const LeapDirectionMap = {
  [CkbExplorer.LeapDirection.In]: LeapDirection.LeapIn,
  [CkbExplorer.LeapDirection.LeapOutBtc]: LeapDirection.LeapOut,
  [CkbExplorer.LeapDirection.WithinBtc]: LeapDirection.Within,
};

registerEnumType(LeapDirection, {
  name: 'LeapDirection',
});

@ObjectType({ description: 'RGB++ Transaction' })
export class RgbppTransaction {
  @Field(() => String)
  ckbTxHash: string;

  @Field(() => String, { nullable: true })
  btcTxid: string;

  @Field(() => LeapDirection, { nullable: true })
  leapDirection: LeapDirection;

  @Field(() => Int)
  blockNumber: number;

  @Field(() => Date)
  timestamp: Date;

  @Field(() => CkbTransaction, { nullable: true })
  ckbTransaction: CkbTransaction;

  @Field(() => BitcoinTransaction, { nullable: true })
  btcTransaction: BitcoinTransaction;

  public static from(tx: CkbExplorer.RgbppTransaction) {
    return {
      ckbTxHash: tx.tx_hash,
      btcTxid: tx.rgb_txid,
      leapDirection: LeapDirectionMap[tx.leap_direction],
      blockNumber: tx.block_number,
      timestamp: new Date(tx.block_timestamp),
    };
  }

  public static fromCkbTransaction(tx: CkbExplorer.Transaction) {
    console.log('tx', tx.create_timestamp);
    return {
      ckbTxHash: tx.transaction_hash,
      btcTxid: tx.rgb_txid,
      blockNumber: toNumber(tx.block_number),
      timestamp: new Date(toNumber(tx.create_timestamp)),
    };
  }
}

@ObjectType({ description: 'RGB++ latest transaction list' })
export class RgbppLatestTransactionList {
  @Field(() => [RgbppTransaction])
  txs: RgbppBaseTransaction[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  pageSize: number;
}
