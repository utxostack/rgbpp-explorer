import { Module } from '@nestjs/common';
import { CkbBlockModule } from './block/block.module';
import { CkbCellModule } from './cell/cell.module';
import { CkbTransactionModule } from './transaction/transaction.module';
import { CkbScriptModule } from './script/script.module';

@Module({
  imports: [CkbBlockModule, CkbTransactionModule, CkbCellModule, CkbScriptModule],
})
export class CkbModule {}
