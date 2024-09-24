/*
  Warnings:

  - You are about to drop the column `difficulty` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `maxFee` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `minFee` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `totalFee` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `fee` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the `Output` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `index` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Output" DROP CONSTRAINT "Output_chainId_txHash_fkey";

-- AlterTable
ALTER TABLE "Block" DROP COLUMN "difficulty",
DROP COLUMN "maxFee",
DROP COLUMN "minFee",
DROP COLUMN "size",
DROP COLUMN "totalFee";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "fee",
DROP COLUMN "size",
DROP COLUMN "timestamp",
ADD COLUMN     "btcTxid" TEXT,
DROP COLUMN "index",
ADD COLUMN     "index" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Output";
