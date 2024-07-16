import { Module } from '@nestjs/common';
import { BlockResolver } from './block.resolver';
import { BlockService } from './block.service';

@Module({
  providers: [BlockResolver, BlockService],
})
export class BlockModule { }
