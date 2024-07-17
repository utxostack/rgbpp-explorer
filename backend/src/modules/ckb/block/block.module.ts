import { Module } from '@nestjs/common';
import { CkbBlockResolver } from './block.resolver';
import { CkbBlockService } from './block.service';
import { CkbExplorerModule } from 'src/core/ckb-explorer/ckb-explorer.module';
import { CkbBlockLoader, CkbBlockTransactionsLoader } from './block.dataloader';

@Module({
  imports: [CkbExplorerModule],
  providers: [CkbBlockResolver, CkbBlockService, CkbBlockTransactionsLoader, CkbBlockLoader],
})
export class CkbBlockModule { }
