import { Field, ObjectType } from '@nestjs/graphql';
import * as CkbRpc from 'src/core/ckb-rpc/ckb-rpc.interface';

@ObjectType({ description: 'CKB Script' })
export class CkbScript {
  @Field(() => String)
  codeHash: string;

  @Field(() => String)
  hashType: string;

  @Field(() => String)
  args: string;

  public static fromCKBRpc(script: CkbRpc.Script): CkbScript {
    return {
      codeHash: script.code_hash,
      hashType: script.hash_type,
      args: script.args,
    };
  }
}
