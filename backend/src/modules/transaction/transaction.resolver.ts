import { Resolver } from '@nestjs/graphql';
import { Transaction } from './transaction.model';

@Resolver(() => Transaction)
export class TransactionResolver {}
