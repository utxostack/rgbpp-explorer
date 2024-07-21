import { toNumber } from 'lodash';
import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { CkbScript } from 'src/modules/ckb/script/script.model';
import * as CkbExplorer from 'src/core/ckb-explorer/ckb-explorer.interface';
import { RgbppTransaction } from '../transaction/transaction.model';

export type RgbppBaseCoin = Omit<RgbppCoin, 'transactions'>;

@ObjectType({ description: 'RGB++ Coin' })
export class RgbppCoin {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => String)
  symbol: string;

  @Field(() => Float)
  decimal: number;

  @Field(() => String, { nullable: true })
  icon: string;

  @Field(() => String)
  typeHash: string;

  @Field(() => CkbScript)
  typeScript: CkbScript;

  @Field(() => Int)
  holdersCount: number;

  @Field(() => Int)
  h24CkbTransactionsCount: number;

  @Field(() => Float)
  totalAmount: number;

  @Field(() => String)
  issuer: string;

  @Field(() => Date)
  deployedAt: Date;

  @Field(() => [RgbppTransaction])
  transactions: RgbppTransaction[];

  public static from(xudt: CkbExplorer.XUDT): RgbppBaseCoin {
    return {
      name: xudt.full_name,
      description: xudt.description,
      symbol: xudt.symbol,
      decimal: toNumber(xudt.decimal),
      icon: xudt.icon_file,
      typeHash: xudt.type_hash,
      typeScript: CkbScript.from(xudt.type_script),
      holdersCount: toNumber(xudt.addresses_count),
      h24CkbTransactionsCount: toNumber(xudt.h24_ckb_transactions_count),
      totalAmount: toNumber(xudt.total_amount),
      issuer: xudt.issuer_address,
      deployedAt: new Date(xudt.created_at),
    };
  }
}

@ObjectType({ description: 'RGB++ Coin List' })
export class RgbppCoinList {
  @Field(() => [RgbppCoin])
  coins: RgbppBaseCoin[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;
}
