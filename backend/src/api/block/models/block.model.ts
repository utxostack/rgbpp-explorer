import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'block' })
export class Block {
  @Field(() => Int)
  height: string;
}
