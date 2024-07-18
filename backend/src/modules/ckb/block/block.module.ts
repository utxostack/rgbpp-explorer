import { Module } from '@nestjs/common';
import { CkbBlockResolver } from './block.resolver';
import { CkbBlockService } from './block.service';
import { CkbExplorerModule } from 'src/core/ckb-explorer/ckb-explorer.module';
import { CkbBlockEconomicStateLoader, CkbBlockLoader } from './block.dataloader';
import { CkbRpcModule } from 'src/core/ckb-rpc/ckb-rpc.module';

@Module({
  imports: [CkbExplorerModule, CkbRpcModule],
  providers: [CkbBlockResolver, CkbBlockService, CkbBlockLoader, CkbBlockEconomicStateLoader],
})
export class CkbBlockModule {}
