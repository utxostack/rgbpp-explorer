import { PrismaService } from 'src/core/database/prisma/prisma.service';

export interface TransactionInputCountsRow {
  chainId: number;
  transactionHash: string;
  blockNumber: number;
  expectedCount: number;
  adjustedActualCount: number;
  countDifference: number;
}

export default async function checkTransactionInputCounts(prismaService: PrismaService) {
  const rows = await prismaService.$queryRaw<TransactionInputCountsRow[]>`
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
      t."hash" as transactionHash,
      t."blockNumber",
      t."inputCount" as expectedCount,
      CASE
        WHEN t."isCellbase" THEN COALESCE(aic.actual_count, 0) + 1
        ELSE COALESCE(aic.actual_count, 0)
      END as adjustedActualCount,
      t."inputCount" - (
        CASE
          WHEN t."isCellbase" THEN COALESCE(aic.actual_count, 0) + 1
          ELSE COALESCE(aic.actual_count, 0)
        END
      ) as countDifference
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
  return rows;
}
