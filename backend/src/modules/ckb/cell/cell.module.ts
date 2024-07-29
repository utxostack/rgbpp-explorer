import { Module } from '@nestjs/common';
import { CkbExplorerModule } from 'src/core/ckb-explorer/ckb-explorer.module';
import { CkbTransactionModule } from '../transaction/transaction.module';
import { CkbCellService } from './cell.service';
import { CkbCellResolver } from './cell.resolver';

@Module({
  imports: [CkbTransactionModule, CkbExplorerModule],
  providers: [CkbCellResolver, CkbCellService],
})
export class CkbCellModule {}
