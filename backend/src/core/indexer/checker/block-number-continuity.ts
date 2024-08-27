import { PrismaService } from 'src/core/database/prisma/prisma.service';

export interface BlockNumberContinuityRow {
  chainId: number;
  currentBlockNumber: number;
  previousBlockNumber: number;
  gap: number;
}

export default async function checkBlockNumberContinuity(prismaService: PrismaService) {
  const rows = await prismaService.$queryRaw<BlockNumberContinuityRow[]>`
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
      d."number" as "currentBlockNumber",
      d.prev_number as "previousBlockNumber",
      d.gap
    FROM
      discontinuities d
    JOIN
      "Chain" c ON d."chainId" = c.id
    ORDER BY
      d."chainId", d."number"
  `;
  return rows;
}
