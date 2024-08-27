import { PrismaService } from "src/core/database/prisma/prisma.service";

export interface TransactionOutputCountsRow {
  chainId: number;
  transactionHash: string;
  blockNumber: number;
  expectedCount: number;
  actualCount: number;
  countDifference: number;
}

export default async function checkTransactionOutputCounts(prismaService: PrismaService) {
  const rows = await prismaService.$queryRaw<TransactionOutputCountsRow[]>`
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
      t."hash" as transactionHash,
      t."blockNumber",
      t."outputCount" as expectedCount,
      COALESCE(aoc.actual_count, 0) as actualCount,
      t."outputCount" - COALESCE(aoc.actual_count, 0) as countDifference
    FROM
      "Transaction" t
    LEFT JOIN
      actual_output_counts aoc ON t."chainId" = aoc."chainId" AND t."hash" = aoc."txHash"
    WHERE
      t."outputCount" != COALESCE(aoc.actual_count, 0)
    ORDER BY
      t."chainId", t."blockNumber", ABS(t."outputCount" - COALESCE(aoc.actual_count, 0)) DESC
  `;
  return rows;
}
