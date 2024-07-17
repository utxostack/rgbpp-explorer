import { Resolver } from '@nestjs/graphql';
import { BitcoinTransaction } from './transaction.model';

@Resolver(() => BitcoinTransaction)
export class BitcoinTransactionResolver { }
