import { Module } from '@nestjs/common';
import { CkbRpcModule } from 'src/core/ckb-rpc/ckb-rpc.module';
import { CkbTransactionResolver } from './transaction.resolver';
import { CkbTransactionService } from './transaction.service';
import { CkbTransactionLoader } from './transaction.dataloader';

@Module({
  imports: [CkbRpcModule],
  providers: [CkbTransactionResolver, CkbTransactionService, CkbTransactionLoader],
  exports: [CkbTransactionService, CkbTransactionLoader],
})
export class CkbTransactionModule {}
