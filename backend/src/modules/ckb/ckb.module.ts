import { Module } from '@nestjs/common';
import { CkbRpcModule } from 'src/core/ckb-rpc/ckb-rpc.module';
import { CkbExplorerModule } from 'src/core/ckb-explorer/ckb-explorer.module';
import { CkbBlockModule } from './block/block.module';
import { CkbCellModule } from './cell/cell.module';
import { CkbTransactionModule } from './transaction/transaction.module';
import { CkbScriptModule } from './script/script.module';
import { CkbResolver } from './ckb.resolver';
import { CkbAddressModule } from './address/address.module';

@Module({
  imports: [
    CkbRpcModule,
    CkbExplorerModule,
    CkbBlockModule,
    CkbTransactionModule,
    CkbAddressModule,
    CkbCellModule,
    CkbScriptModule,
  ],
  providers: [CkbResolver],
})
export class CkbModule {}
