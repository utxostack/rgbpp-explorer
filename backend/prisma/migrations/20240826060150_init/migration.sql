-- CreateEnum
CREATE TYPE "LeapDirection" AS ENUM ('LeapIn', 'LeapOut', 'Within');

-- CreateTable
CREATE TABLE "Chain" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "ws" TEXT NOT NULL,
    "startBlock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" SERIAL NOT NULL,
    "chainId" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "transactionsCount" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "totalFee" BIGINT NOT NULL,
    "minFee" BIGINT NOT NULL,
    "maxFee" BIGINT NOT NULL,
    "difficulty" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "chainId" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "index" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "fee" BIGINT NOT NULL,
    "size" INTEGER NOT NULL,
    "isCellbase" BOOLEAN NOT NULL DEFAULT false,
    "isRgbpp" BOOLEAN NOT NULL DEFAULT false,
    "leapDirection" "LeapDirection",
    "inputCount" INTEGER NOT NULL,
    "outputCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Output" (
    "id" SERIAL NOT NULL,
    "chainId" INTEGER NOT NULL,
    "txHash" TEXT NOT NULL,
    "index" TEXT NOT NULL,
    "consumedByTxHash" TEXT,
    "consumedByIndex" TEXT,
    "capacity" BIGINT NOT NULL,
    "lockScriptHash" CHAR(66) NOT NULL,
    "typeScriptHash" CHAR(66),
    "isLive" BOOLEAN NOT NULL DEFAULT true,
    "rgbppBound" BOOLEAN NOT NULL DEFAULT false,
    "boundBtcTxId" TEXT,
    "boundBtcTxIndex" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Output_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LockScript" (
    "id" SERIAL NOT NULL,
    "chainId" INTEGER NOT NULL,
    "codeHash" CHAR(66) NOT NULL,
    "hashType" TEXT NOT NULL,
    "args" TEXT NOT NULL,
    "scriptHash" CHAR(66) NOT NULL,
    "isRgbppLock" BOOLEAN NOT NULL DEFAULT false,
    "isBtcTimeLock" BOOLEAN NOT NULL DEFAULT false,
    "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LockScript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeScript" (
    "id" SERIAL NOT NULL,
    "chainId" INTEGER NOT NULL,
    "codeHash" CHAR(66) NOT NULL,
    "hashType" TEXT NOT NULL,
    "args" TEXT NOT NULL,
    "scriptHash" CHAR(66) NOT NULL,
    "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TypeScript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "chainId" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "lockScriptId" INTEGER NOT NULL,
    "balance" BIGINT NOT NULL,
    "balanceOccupied" BIGINT NOT NULL,
    "transactionCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UDT" (
    "id" SERIAL NOT NULL,
    "chainId" INTEGER NOT NULL,
    "typeHash" TEXT NOT NULL,
    "typeScriptId" INTEGER NOT NULL,
    "name" TEXT,
    "symbol" TEXT NOT NULL,
    "decimal" INTEGER NOT NULL,
    "description" TEXT,
    "totalSupply" BIGINT NOT NULL,
    "holdersCount" INTEGER NOT NULL,
    "transactionCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UDT_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Statistic" (
    "id" SERIAL NOT NULL,
    "chainId" INTEGER NOT NULL,
    "tipBlockNumber" INTEGER NOT NULL,
    "tipBlockHash" TEXT NOT NULL,
    "totalTransactions" BIGINT NOT NULL,
    "totalCapacity" BIGINT NOT NULL,
    "totalAddresses" BIGINT NOT NULL,
    "averageBlockTime" DOUBLE PRECISION NOT NULL,
    "currentDifficulty" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Statistic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndexerStatus" (
    "id" SERIAL NOT NULL,
    "chainId" INTEGER NOT NULL,
    "lastIndexedBlock" INTEGER NOT NULL,
    "lastIndexedTx" TEXT NOT NULL,
    "isIndexing" BOOLEAN NOT NULL,
    "lastIndexedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndexerStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Block_chainId_hash_key" ON "Block"("chainId", "hash");

-- CreateIndex
CREATE UNIQUE INDEX "Block_chainId_number_key" ON "Block"("chainId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_chainId_hash_key" ON "Transaction"("chainId", "hash");

-- CreateIndex
CREATE UNIQUE INDEX "Output_chainId_txHash_index_key" ON "Output"("chainId", "txHash", "index");

-- CreateIndex
CREATE UNIQUE INDEX "LockScript_scriptHash_key" ON "LockScript"("scriptHash");

-- CreateIndex
CREATE UNIQUE INDEX "LockScript_chainId_id_key" ON "LockScript"("chainId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "LockScript_chainId_scriptHash_key" ON "LockScript"("chainId", "scriptHash");

-- CreateIndex
CREATE UNIQUE INDEX "TypeScript_scriptHash_key" ON "TypeScript"("scriptHash");

-- CreateIndex
CREATE UNIQUE INDEX "TypeScript_chainId_id_key" ON "TypeScript"("chainId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "TypeScript_chainId_scriptHash_key" ON "TypeScript"("chainId", "scriptHash");

-- CreateIndex
CREATE UNIQUE INDEX "Address_chainId_address_key" ON "Address"("chainId", "address");

-- CreateIndex
CREATE UNIQUE INDEX "UDT_chainId_typeHash_key" ON "UDT"("chainId", "typeHash");

-- CreateIndex
CREATE UNIQUE INDEX "Statistic_chainId_key" ON "Statistic"("chainId");

-- CreateIndex
CREATE UNIQUE INDEX "IndexerStatus_chainId_key" ON "IndexerStatus"("chainId");

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_chainId_blockNumber_fkey" FOREIGN KEY ("chainId", "blockNumber") REFERENCES "Block"("chainId", "number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Output" ADD CONSTRAINT "Output_chainId_txHash_fkey" FOREIGN KEY ("chainId", "txHash") REFERENCES "Transaction"("chainId", "hash") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Output" ADD CONSTRAINT "Output_chainId_lockScriptHash_fkey" FOREIGN KEY ("chainId", "lockScriptHash") REFERENCES "LockScript"("chainId", "scriptHash") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Output" ADD CONSTRAINT "Output_chainId_typeScriptHash_fkey" FOREIGN KEY ("chainId", "typeScriptHash") REFERENCES "TypeScript"("chainId", "scriptHash") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_chainId_lockScriptId_fkey" FOREIGN KEY ("chainId", "lockScriptId") REFERENCES "LockScript"("chainId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UDT" ADD CONSTRAINT "UDT_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UDT" ADD CONSTRAINT "UDT_chainId_typeScriptId_fkey" FOREIGN KEY ("chainId", "typeScriptId") REFERENCES "TypeScript"("chainId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Statistic" ADD CONSTRAINT "Statistic_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndexerStatus" ADD CONSTRAINT "IndexerStatus_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
