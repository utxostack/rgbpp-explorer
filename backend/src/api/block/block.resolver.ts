import { Args, Query, Resolver } from '@nestjs/graphql';
import { Block } from './models/block.model';
import { BlockService } from './block.service';

@Resolver(() => Block)
export class BlockResolver {
  constructor(private blockService: BlockService) {}

  @Query(() => Block, { nullable: true })
  public async blockByHash(@Args('hash') hash: string): Promise<Block> {
    const block = await this.blockService.getBlockByHash(hash);
    if (!block) {
      return null;
    }
    return Block.from(block);
  }
}
