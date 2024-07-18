import { Module } from '@nestjs/common';
import { CkbCellService } from './cell.service';
import { CellResolver } from './cell.resolver';
import { CkbTransactionModule } from '../transaction/transaction.module';
import { CkbExplorerModule } from 'src/core/ckb-explorer/ckb-explorer.module';

@Module({
  imports: [CkbTransactionModule, CkbExplorerModule],
  providers: [CellResolver, CkbCellService],
})
export class CkbCellModule {}
