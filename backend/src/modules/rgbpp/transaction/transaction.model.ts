import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import * as CkbExplorer from 'src/core/ckb-explorer/ckb-explorer.interface';
import { BitcoinTransaction } from 'src/modules/bitcoin/transaction/transaction.model';
import { CkbTransaction } from 'src/modules/ckb/transaction/transaction.model';

export type RgbppBaseTransaction = Omit<RgbppTransaction, 'ckbTransaction' | 'btcTransaction'>;

enum LeapDirection {
  LeapIn = 'leap_in',
  LeapOut = 'leap_out',
  Within = 'within',
}

const LeapDirectionMap = {
  [CkbExplorer.LeapDirection.In]: LeapDirection.LeapIn,
  [CkbExplorer.LeapDirection.LeapoutBTC]: LeapDirection.LeapOut,
  [CkbExplorer.LeapDirection.WithinBTC]: LeapDirection.Within,
};

registerEnumType(LeapDirection, {
  name: 'LeapDirection',
});

@ObjectType({ description: 'RGB++ Transaction' })
export class RgbppTransaction {
  @Field(() => String)
  ckbTxHash: string;

  @Field(() => String)
  btcTxid: string;

  // FIXME: need to be fixed, don't know why it's null from the explorer api
  @Field(() => LeapDirection, { nullable: true })
  leapDirection: LeapDirection;

  @Field(() => Int)
  blockNumber: number;

  @Field(() => Date)
  timestamp: Date;

  @Field(() => CkbTransaction)
  ckbTransaction: CkbTransaction;

  @Field(() => BitcoinTransaction, { nullable: true })
  btcTransaction: BitcoinTransaction;

  public static fromCkbExplorer(tx: CkbExplorer.RgbppTransaction) {
    return {
      ckbTxHash: tx.tx_hash,
      btcTxid: tx.rgb_txid,
      leapDirection: LeapDirectionMap[tx.leap_direction],
      blockNumber: tx.block_number,
      timestamp: new Date(tx.block_timestamp),
    };
  }
}
