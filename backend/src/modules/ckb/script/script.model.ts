import { HashType } from '@ckb-lumos/lumos';
import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import * as CkbRpc from 'src/core/ckb-rpc/ckb-rpc.interface';

export enum CellType {
  XUDT = 'XUDT',
  SUDT = 'SUDT',
  DOB = 'DOB',
  MNFT = 'mNFT',
}

registerEnumType(CellType, {
  name: 'CellType',
  description: 'Cell type (XUDT, SUDT, Dobs, mNFT)',
});

@InputType({ description: 'CKB Script' })
export class CkbScriptInput {
  @Field(() => String)
  codeHash: string;

  @Field(() => String)
  hashType: HashType;

  @Field(() => String)
  args: string;
}

@ObjectType({ description: 'CKB Script' })
export class CkbScript {
  @Field(() => String)
  codeHash: string;

  @Field(() => String)
  hashType: HashType;

  @Field(() => String)
  args: string;

  public static from(script: CkbRpc.Script): CkbScript | null {
    if (!script) {
      return null;
    }
    return {
      codeHash: script.code_hash,
      hashType: script.hash_type as HashType,
      args: script.args,
    };
  }
}
