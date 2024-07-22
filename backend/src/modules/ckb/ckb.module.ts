import { Module } from '@nestjs/common';
import { CkbBlockModule } from './block/block.module';
import { CkbCellModule } from './cell/cell.module';
import { CkbTransactionModule } from './transaction/transaction.module';
import { CkbScriptModule } from './script/script.module';
import { CkbResolver } from './ckb.resolver';
import { CkbRpcModule } from 'src/core/ckb-rpc/ckb-rpc.module';

@Module({
  imports: [CkbRpcModule, CkbBlockModule, CkbTransactionModule, CkbCellModule, CkbScriptModule],
  providers: [CkbResolver],
})
export class CkbModule { }
