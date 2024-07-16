import { Module } from '@nestjs/common';
import { CellService } from './cell.service';
import { CellResolver } from './cell.resolver';

@Module({
  imports: [],
  providers: [CellResolver, CellService],
})
export class CellModule {}
