import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import checkBlockNumberContinuity from './checker/block-number-continuity';
import checkBlockTransactionCounts from './checker/block-transaction-counts';
import checkTransactionOutputCounts from './checker/transaction-output-counts';
// import checkTransactionInputCounts from './checker/transaction-input-counts';

export interface IndexerValidationResult {
  blockNumberContinuity: any[];
  blockTransactionCounts: any[];
  // transactionInputCounts: any[];
  transactionOutputCounts: any[];
}

@Injectable()
export class IndexerValidator {
  constructor(private prismaService: PrismaService) { }

  public async validate(): Promise<{ valid: boolean; result: IndexerValidationResult }> {
    const blockNumberContinuity = await checkBlockNumberContinuity(this.prismaService);
    const blockTransactionCounts = await checkBlockTransactionCounts(this.prismaService);
    // const transactionInputCounts = await checkTransactionInputCounts(this.prismaService);
    const transactionOutputCounts = await checkTransactionOutputCounts(this.prismaService);

    const result = {
      blockNumberContinuity,
      blockTransactionCounts,
      // transactionInputCounts,
      transactionOutputCounts,
    };
    const valid = Object.values(result).every((rows) => rows.length === 0);

    return {
      valid,
      result,
    };
  }
}
