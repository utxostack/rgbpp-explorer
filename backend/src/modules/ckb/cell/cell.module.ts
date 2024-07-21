import { Module } from '@nestjs/common';
import { CkbExplorerModule } from 'src/core/ckb-explorer/ckb-explorer.module';
import { CkbTransactionModule } from '../transaction/transaction.module';
import { CkbCellService } from './cell.service';
import { CellResolver } from './cell.resolver';

@Module({
  imports: [CkbTransactionModule, CkbExplorerModule],
  providers: [CellResolver, CkbCellService],
})
export class CkbCellModule {}
