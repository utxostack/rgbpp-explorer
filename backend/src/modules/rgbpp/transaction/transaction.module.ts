import { Module } from '@nestjs/common';
import { RgbppTransactionResolver } from './transaction.resolver';
import { CkbExplorerModule } from 'src/core/ckb-explorer/ckb-explorer.module';
import { RgbppTransactionService } from './transaction.service';
import { CkbTransactionModule } from 'src/modules/ckb/transaction/transaction.module';

@Module({
  imports: [CkbExplorerModule, CkbTransactionModule],
  providers: [RgbppTransactionResolver, RgbppTransactionService],
})
export class TransactionModule {}
