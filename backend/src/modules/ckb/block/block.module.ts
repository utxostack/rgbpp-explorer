import { Module } from '@nestjs/common';
import { CkbRpcModule } from 'src/core/ckb-rpc/ckb-rpc.module';
import { CkbExplorerModule } from 'src/core/ckb-explorer/ckb-explorer.module';
import { CkbBlockResolver } from './block.resolver';
import { CkbBlockService } from './block.service';
import {
  CkbBlockEconomicStateLoader,
  CkbExplorerBlockLoader,
  CkbRpcBlockLoader,
} from './block.dataloader';

@Module({
  imports: [CkbExplorerModule, CkbRpcModule],
  providers: [
    CkbBlockResolver,
    CkbBlockService,
    CkbRpcBlockLoader,
    CkbExplorerBlockLoader,
    CkbBlockEconomicStateLoader,
  ],
  exports: [
    CkbBlockService,
    CkbRpcBlockLoader,
    CkbExplorerBlockLoader,
    CkbBlockEconomicStateLoader,
  ],
})
export class CkbBlockModule {}
