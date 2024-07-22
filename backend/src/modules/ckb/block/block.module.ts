import { Module } from '@nestjs/common';
import { CkbRpcModule } from 'src/core/ckb-rpc/ckb-rpc.module';
import { CkbExplorerModule } from 'src/core/ckb-explorer/ckb-explorer.module';
import { CkbBlockResolver } from './block.resolver';
import { CkbBlockService } from './block.service';
import { CkbBlockEconomicStateLoader, CkbBlockLoader } from './block.dataloader';

@Module({
  imports: [CkbExplorerModule, CkbRpcModule],
  providers: [CkbBlockResolver, CkbBlockService, CkbBlockLoader, CkbBlockEconomicStateLoader],
})
export class CkbBlockModule {}
