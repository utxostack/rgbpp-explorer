import { Module } from '@nestjs/common';
import { BitcoinApiModule } from 'src/core/bitcoin-api/bitcoin-api.module';
import { CkbExplorerModule } from 'src/core/ckb-explorer/ckb-explorer.module';
import { CkbTransactionModule } from 'src/modules/ckb/transaction/transaction.module';
import { RgbppTransactionResolver } from './transaction.resolver';
import { RgbppTransactionService } from './transaction.service';
import { RgbppTransactionLoader } from './transaction.dataloader';
import { CkbRpcModule } from 'src/core/ckb-rpc/ckb-rpc.module';

@Module({
  imports: [CkbExplorerModule, CkbRpcModule, CkbTransactionModule, BitcoinApiModule],
  providers: [RgbppTransactionResolver, RgbppTransactionService, RgbppTransactionLoader],
  exports: [RgbppTransactionLoader],
})
export class RgbppTransactionModule {}
