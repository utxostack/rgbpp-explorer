import { Module } from '@nestjs/common';
import { BitcoinApiModule } from 'src/core/bitcoin-api/bitcoin-api.module';
import { CkbExplorerModule } from 'src/core/ckb-explorer/ckb-explorer.module';
import { CkbTransactionModule } from 'src/modules/ckb/transaction/transaction.module';
import { RgbppTransactionResolver } from './transaction.resolver';
import { RgbppTransactionService } from './transaction.service';

@Module({
  imports: [CkbExplorerModule, CkbTransactionModule, BitcoinApiModule],
  providers: [RgbppTransactionResolver, RgbppTransactionService],
})
export class RgbppTransactionModule {}
