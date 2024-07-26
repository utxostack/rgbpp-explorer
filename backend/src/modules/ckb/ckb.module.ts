import { Module } from '@nestjs/common';
import { CkbRpcModule } from 'src/core/ckb-rpc/ckb-rpc.module';
import { CkbBlockModule } from './block/block.module';
import { CkbCellModule } from './cell/cell.module';
import { CkbTransactionModule } from './transaction/transaction.module';
import { CkbScriptModule } from './script/script.module';
import { CkbResolver } from './ckb.resolver';
import { CkbAddressModule } from './address/address.module';

@Module({
  imports: [
    CkbRpcModule,
    CkbBlockModule,
    CkbTransactionModule,
    CkbAddressModule,
    CkbCellModule,
    CkbScriptModule,
  ],
  providers: [CkbResolver],
})
export class CkbModule {}
