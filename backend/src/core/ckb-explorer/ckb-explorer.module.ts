import { Module } from '@nestjs/common';
import { CkbExplorerService } from './ckb-explorer.service';

@Module({
  providers: [CkbExplorerService],
  exports: [CkbExplorerService],
})
export class CkbExplorerModule {}
