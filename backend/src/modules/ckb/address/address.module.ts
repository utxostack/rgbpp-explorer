import { Module } from '@nestjs/common';
import { CkbExplorerModule } from 'src/core/ckb-explorer/ckb-explorer.module';
import { CkbTransactionModule } from '../transaction/transaction.module';
import { CkbAddressResolver } from './address.resolver';
import { CkbAddressLoader, CkbAddressTransactionsLoader } from './address.dataloader';

@Module({
  imports: [CkbExplorerModule, CkbTransactionModule],
  providers: [CkbAddressResolver, CkbAddressLoader, CkbAddressTransactionsLoader],
  exports: [CkbAddressLoader, CkbAddressTransactionsLoader],
})
export class CkbAddressModule {}
