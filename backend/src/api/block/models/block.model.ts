import { Field, Int, ObjectType } from '@nestjs/graphql';
import PrismaClient from '@prisma/client';

@ObjectType({ description: 'block' })
export class Block {
  @Field(() => Int)
  hash: string;

  public static from(block: PrismaClient.Block): Block {
    return {
      hash: block.blockHash,
    };
  }
}
