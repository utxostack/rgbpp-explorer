import { Module } from '@nestjs/common';
import { BlockResolver } from './block.resolver';
import { BlockService } from './block.service';
import { CKBExplorerModule } from 'src/core/ckb-explorer/ckb-explorer.module';
import { BlockLoader, BlockTransactionsLoader } from './block.dataloader';

@Module({
  imports: [CKBExplorerModule],
  providers: [BlockResolver, BlockService, BlockTransactionsLoader, BlockLoader],
})
export class BlockModule { }
