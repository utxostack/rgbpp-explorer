import { Module } from '@nestjs/common';
import { TransactionResolver } from './transaction.resolver';
import { TransactionService } from './transaction.service';

@Module({
  imports: [],
  providers: [TransactionResolver, TransactionService],
})
export class TransactionModule {}
