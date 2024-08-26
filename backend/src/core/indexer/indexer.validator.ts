import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class IndexerValidator {
  private logger = new Logger(IndexerValidator.name);

  constructor(private prismaService: PrismaService) { }

  public async validate() {
    if (!(await this.checkBlockNumberContinuity())) {
      this.logger.error('Block number continuity issue');
      return false;
    }
    if (!(await this.checkBlockTransactions())) {
      this.logger.error('Block transactions count mismatch');
      return false;
    }
    if (!(await this.checkTransactionInputs())) {
      this.logger.error('Transaction inputs count mismatch');
      return false;
    }
    if (!(await this.checkTransactionOutputs())) {
      this.logger.error('Transaction outputs count mismatch');
      return false;
    }
    return true;
  }

  private async checkBlockNumberContinuity() {
    const result: unknown[] = await this.prismaService.$queryRaw`
      WITH numbered_blocks AS (
        SELECT
          "chainId",
          "number",
          LAG("number") OVER (PARTITION BY "chainId" ORDER BY "number") as prev_number
        FROM
          "Block"
      ),
      discontinuities AS (
        SELECT
          "chainId",
          "number",
          prev_number,
          "number" - prev_number as gap
        FROM
          numbered_blocks
        WHERE
          "number" - prev_number != 1
          AND prev_number IS NOT NULL
      )
      SELECT
        d."chainId",
        c."name" as chain_name,
        d."number" as current_block_number,
        d.prev_number as previous_block_number,
        d.gap,
        CASE
          WHEN d.gap > 1 THEN 'Missing blocks'
          WHEN d.gap < 1 THEN 'Duplicate blocks'
          ELSE 'Unknown issue'
        END as issue_type
      FROM
        discontinuities d
      JOIN
        "Chain" c ON d."chainId" = c.id
      ORDER BY
        d."chainId", d."number"
    `;
    return result.length === 0;
  }

  private async checkBlockTransactions() {
    const result: unknown[] = await this.prismaService.$queryRaw`
      WITH transaction_counts AS (
        SELECT
          "chainId",
          "blockNumber",
          COUNT(*) as actual_count
        FROM
          "Transaction"
        GROUP BY
          "chainId", "blockNumber"
      )
      SELECT
        b."chainId",
        b."number" as "blockNumber",
        b."hash" as "blockHash",
        b."transactionsCount" as expected_count,
        tc.actual_count,
        b."transactionsCount" - tc.actual_count as count_difference
      FROM
        "Block" b
      JOIN
        transaction_counts tc ON b."chainId" = tc."chainId" AND b."number" = tc."blockNumber"
      WHERE
        b."transactionsCount" != tc.actual_count
      ORDER BY
        b."chainId", b."number"
    `;
    return result.length === 0;
  }

  private async checkTransactionInputs() {
    const result: unknown[] = await this.prismaService.$queryRaw`
      WITH actual_input_counts AS (
        SELECT
          "chainId",
          "consumedByTxHash" as tx_hash,
          COUNT(*) as actual_count
        FROM
          "Output"
        WHERE
          "consumedByTxHash" IS NOT NULL
        GROUP BY
          "chainId", "consumedByTxHash"
      )
      SELECT
        t."chainId",
        t."hash" as transaction_hash,
        t."blockNumber",
        t."inputCount" as expected_count,
        CASE
          WHEN t."isCellbase" THEN COALESCE(aic.actual_count, 0) + 1
          ELSE COALESCE(aic.actual_count, 0)
        END as adjusted_actual_count,
        t."inputCount" - (
          CASE
            WHEN t."isCellbase" THEN COALESCE(aic.actual_count, 0) + 1
            ELSE COALESCE(aic.actual_count, 0)
          END
        ) as count_difference
      FROM
        "Transaction" t
      LEFT JOIN
        actual_input_counts aic ON t."chainId" = aic."chainId" AND t."hash" = aic.tx_hash
      WHERE
        t."inputCount" != (
          CASE
            WHEN t."isCellbase" THEN COALESCE(aic.actual_count, 0) + 1
            ELSE COALESCE(aic.actual_count, 0)
          END
        )
      ORDER BY
        t."chainId", t."blockNumber", ABS(t."inputCount" - (
          CASE
            WHEN t."isCellbase" THEN COALESCE(aic.actual_count, 0) + 1
            ELSE COALESCE(aic.actual_count, 0)
          END
        )) DESC
    `;
    return result.length === 0;
  }

  private async checkTransactionOutputs() {
    const result: unknown[] = await this.prismaService.$queryRaw`
      WITH actual_output_counts AS (
        SELECT
          "chainId",
          "txHash",
          COUNT(*) as actual_count
        FROM
          "Output"
        GROUP BY
          "chainId", "txHash"
      )
      SELECT
        t."chainId",
        t."hash" as transaction_hash,
        t."blockNumber",
        t."outputCount" as expected_count,
        COALESCE(aoc.actual_count, 0) as actual_count,
        t."outputCount" - COALESCE(aoc.actual_count, 0) as count_difference
      FROM
        "Transaction" t
      LEFT JOIN
        actual_output_counts aoc ON t."chainId" = aoc."chainId" AND t."hash" = aoc."txHash"
      WHERE
        t."outputCount" != COALESCE(aoc.actual_count, 0)
      ORDER BY
        t."chainId", t."blockNumber", ABS(t."outputCount" - COALESCE(aoc.actual_count, 0)) DESC
    `;
    return result.length === 0;
  }
}
