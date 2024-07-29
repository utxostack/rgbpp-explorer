import { Module } from '@nestjs/common';
import { CkbRpcModule } from 'src/core/ckb-rpc/ckb-rpc.module';
import { CkbExplorerModule } from 'src/core/ckb-explorer/ckb-explorer.module';
import { CkbTransactionResolver } from './transaction.resolver';
import { CkbTransactionService } from './transaction.service';
import { CkbExplorerTransactionLoader, CkbRpcTransactionLoader } from './transaction.dataloader';

@Module({
  imports: [CkbRpcModule, CkbExplorerModule],
  providers: [
    CkbTransactionResolver,
    CkbTransactionService,
    CkbRpcTransactionLoader,
    CkbExplorerTransactionLoader,
  ],
  exports: [CkbTransactionService, CkbRpcTransactionLoader, CkbExplorerTransactionLoader],
})
export class CkbTransactionModule {}
