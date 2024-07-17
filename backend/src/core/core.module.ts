import { Module } from '@nestjs/common';
// import { DatabaseModule } from './database/database.module';
import { CkbExplorerModule } from './ckb-explorer/ckb-explorer.module';
import { CkbExplorerService } from './ckb-explorer/ckb-explorer.service';

@Module({
  imports: [
    // DatabaseModule,
    CkbExplorerModule,
  ],
  providers: [CkbExplorerService],
  exports: [CkbExplorerService],
})
export class CoreModule { }
