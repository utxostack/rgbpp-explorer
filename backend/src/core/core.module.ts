import { Module } from '@nestjs/common';
// import { DatabaseModule } from './database/database.module';
import { CKBExplorerModule } from './ckb-explorer/ckb-explorer.module';
import { CKBExplorerService } from './ckb-explorer/ckb-explorer.service';

@Module({
  imports: [
    // DatabaseModule,
    CKBExplorerModule,
  ],
  providers: [CKBExplorerService],
  exports: [CKBExplorerService],
})
export class CoreModule { }
