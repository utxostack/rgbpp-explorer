import { Module } from '@nestjs/common';
import { CKBExplorerService } from './ckb-explorer.service';

@Module({
  providers: [CKBExplorerService],
  exports: [CKBExplorerService],
})
export class CKBExplorerModule {}
