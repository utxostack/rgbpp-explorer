import { forwardRef, Module } from '@nestjs/common';
import { CkbExplorerService } from './ckb-explorer.service';
import { CkbRpcModule } from '../ckb-rpc/ckb-rpc.module';

@Module({
  imports: [forwardRef(() => CkbRpcModule)],
  providers: [CkbExplorerService],
  exports: [CkbExplorerService],
})
export class CkbExplorerModule {}
