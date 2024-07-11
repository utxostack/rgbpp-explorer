import { Module } from '@nestjs/common';
import { BlockResolver } from './block.resolver';

@Module({
  providers: [BlockResolver],
})
export class BlockModule {}
