import { PrismaService } from "src/core/database/prisma/prisma.service";

export interface BlockTransactionCountsRow {
  chainId: number;
  blockNumber: number;
  blockHash: string;
  expectedCount: number;
  actualCount: number;
  countDifference: number;
}

export default async function checkBlockTransactionCounts(prismaService: PrismaService) {
  const rows = await prismaService.$queryRaw<BlockTransactionCountsRow[]>`
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
      b."transactionsCount" as expectedCount,
      tc.actual_count as actualCount,
      b."transactionsCount" - tc.actual_count as countDifference
    FROM
      "Block" b
    JOIN
      transaction_counts tc ON b."chainId" = tc."chainId" AND b."number" = tc."blockNumber"
    WHERE
      b."transactionsCount" != tc.actual_count
    ORDER BY
      b."chainId", b."number"
  `;
  return rows;
}
