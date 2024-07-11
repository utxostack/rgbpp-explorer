import { Args, Query, Resolver } from '@nestjs/graphql';
import { Block } from './models/block.model';

@Resolver(() => Block)
export class BlockResolver {
  @Query(() => Block)
  public async block(@Args('height') height: string): Promise<Block> {
    return {
      height,
    };
  }
}
