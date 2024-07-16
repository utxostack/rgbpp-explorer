-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'confirmed');

-- CreateTable
CREATE TABLE "blocks" (
    "id" BIGSERIAL NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "blockHash" CHAR(64) NOT NULL,
    "parentHash" CHAR(64) NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL,
    "transactionsCount" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "totalFee" BIGINT NOT NULL,
    "minFee" BIGINT NOT NULL,
    "maxFee" BIGINT NOT NULL,
    "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" BIGSERIAL NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "blockId" BIGINT NOT NULL,
    "blockHash" CHAR(64) NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "txHash" CHAR(64) NOT NULL,
    "index" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL,
    "outputSum" BIGINT NOT NULL,
    "size" INTEGER NOT NULL,
    "fee" BIGINT NOT NULL,
    "cellDeps" JSONB NOT NULL DEFAULT '{}',
    "headerDeps" JSONB NOT NULL DEFAULT '[]',
    "witnesses" JSONB NOT NULL DEFAULT '[]',
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outputs" (
    "id" BIGSERIAL NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "txId" BIGINT NOT NULL,
    "txHash" CHAR(64) NOT NULL,
    "index" INTEGER NOT NULL,
    "capacity" BIGINT NOT NULL,
    "occupiedCapacity" BIGINT NOT NULL,
    "consumedByTxHash" CHAR(64) NOT NULL,
    "consumedByTxId" BIGINT NOT NULL,
    "consumedByCellIndex" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL,
    "lockScriptId" BIGINT NOT NULL,
    "typeScriptId" BIGINT NOT NULL,
    "udtId" BIGINT NOT NULL,
    "udtAmount" DECIMAL(39,0) NOT NULL,
    "udtSymbol" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "dataSize" INTEGER NOT NULL,
    "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outputs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lock_scripts" (
    "id" BIGSERIAL NOT NULL,
    "codeHash" CHAR(64) NOT NULL,
    "hashType" INTEGER NOT NULL,
    "args" TEXT NOT NULL,
    "scriptHash" CHAR(64) NOT NULL,
    "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lock_scripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "type_scripts" (
    "id" BIGSERIAL NOT NULL,
    "codeHash" CHAR(64) NOT NULL,
    "hashType" INTEGER NOT NULL,
    "args" TEXT NOT NULL,
    "scriptHash" CHAR(64) NOT NULL,
    "lockScriptId" BIGINT NOT NULL,
    "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "type_scripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "udts" (
    "id" BIGSERIAL NOT NULL,
    "deployerLockScriptId" BIGINT NOT NULL,
    "isFirst" BOOLEAN NOT NULL DEFAULT false,
    "udtTypeHash" CHAR(64) NOT NULL,
    "decimal" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "blockTimestamp" TIMESTAMP(6) NOT NULL,
    "createdTxHash" CHAR(64) NOT NULL,
    "uniqueCellScriptHash" CHAR(64) NOT NULL,
    "typeScriptId" BIGINT NOT NULL,
    "logo" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "udts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balances" (
    "id" BIGSERIAL NOT NULL,
    "assetType" INTEGER NOT NULL,
    "scriptHash" TEXT,
    "decimal" INTEGER NOT NULL,
    "lockScriptId" BIGINT NOT NULL,
    "symbol" INTEGER NOT NULL,
    "symbolStr" TEXT NOT NULL,
    "capacity" DECIMAL(39,0) NOT NULL,
    "pendingCapacity" DECIMAL(39,0) NOT NULL,
    "occupiedCapacity" DECIMAL(39,0) NOT NULL,
    "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chain_stats" (
    "id" BIGSERIAL NOT NULL,
    "totalTxsCount" INTEGER NOT NULL,
    "h24TxsCount" INTEGER NOT NULL,
    "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chain_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blocks_blockHash_key" ON "blocks"("blockHash");

-- CreateIndex
CREATE UNIQUE INDEX "blocks_blockNumber_key" ON "blocks"("blockNumber");

-- CreateIndex
CREATE INDEX "blocks_blockNumber_idx" ON "blocks"("blockNumber" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "transactions_txHash_key" ON "transactions"("txHash");

-- CreateIndex
CREATE INDEX "transactions_blockNumber_idx" ON "transactions"("blockNumber");

-- CreateIndex
CREATE INDEX "transactions_timestamp_idx" ON "transactions"("timestamp");

-- CreateIndex
CREATE INDEX "outputs_blockNumber_idx" ON "outputs"("blockNumber");

-- CreateIndex
CREATE UNIQUE INDEX "outputs_txHash_index_key" ON "outputs"("txHash", "index");

-- CreateIndex
CREATE UNIQUE INDEX "outputs_consumedByTxHash_consumedByCellIndex_key" ON "outputs"("consumedByTxHash", "consumedByCellIndex");

-- CreateIndex
CREATE UNIQUE INDEX "lock_scripts_scriptHash_key" ON "lock_scripts"("scriptHash");

-- CreateIndex
CREATE UNIQUE INDEX "type_scripts_scriptHash_key" ON "type_scripts"("scriptHash");

-- CreateIndex
CREATE INDEX "type_scripts_lockScriptId_idx" ON "type_scripts"("lockScriptId");

-- CreateIndex
CREATE UNIQUE INDEX "udts_udtTypeHash_key" ON "udts"("udtTypeHash");

-- CreateIndex
CREATE UNIQUE INDEX "udts_uniqueCellScriptHash_key" ON "udts"("uniqueCellScriptHash");

-- CreateIndex
CREATE INDEX "balances_lockScriptId_idx" ON "balances"("lockScriptId");

-- CreateIndex
CREATE UNIQUE INDEX "balances_scriptHash_lockScriptId_key" ON "balances"("scriptHash", "lockScriptId");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "blocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outputs" ADD CONSTRAINT "outputs_txId_fkey" FOREIGN KEY ("txId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outputs" ADD CONSTRAINT "outputs_lockScriptId_fkey" FOREIGN KEY ("lockScriptId") REFERENCES "lock_scripts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outputs" ADD CONSTRAINT "outputs_typeScriptId_fkey" FOREIGN KEY ("typeScriptId") REFERENCES "type_scripts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outputs" ADD CONSTRAINT "outputs_udtId_fkey" FOREIGN KEY ("udtId") REFERENCES "udts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "type_scripts" ADD CONSTRAINT "type_scripts_lockScriptId_fkey" FOREIGN KEY ("lockScriptId") REFERENCES "lock_scripts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "udts" ADD CONSTRAINT "udts_typeScriptId_fkey" FOREIGN KEY ("typeScriptId") REFERENCES "type_scripts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "udts" ADD CONSTRAINT "udts_deployerLockScriptId_fkey" FOREIGN KEY ("deployerLockScriptId") REFERENCES "lock_scripts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balances" ADD CONSTRAINT "balances_lockScriptId_fkey" FOREIGN KEY ("lockScriptId") REFERENCES "lock_scripts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
