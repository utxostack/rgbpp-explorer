import { Module } from '@nestjs/common';
import { CkbCellService } from './cell.service';
import { CellResolver } from './cell.resolver';
import { CkbTransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [CkbTransactionModule],
  providers: [CellResolver, CkbCellService],
})
export class CkbCellModule {}
