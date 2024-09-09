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
    "ownerAddress" TEXT,
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
CREATE TABLE "Asset" (
    "id" SERIAL NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "txHash" TEXT NOT NULL,
    "index" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "lockScriptHash" CHAR(66) NOT NULL,
    "typeScriptHash" CHAR(66) NOT NULL,
    "amount" DECIMAL(65,0) NOT NULL DEFAULT 0,
    "assetTypeId" INTEGER NOT NULL,
    "isLive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetType" (
    "id" SERIAL NOT NULL,
    "chainId" INTEGER NOT NULL,
    "codeHash" CHAR(66) NOT NULL,
    "hashType" TEXT NOT NULL,
    "fungible" BOOLEAN NOT NULL DEFAULT false,
    "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetType_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "Asset_chainId_txHash_index_key" ON "Asset"("chainId", "txHash", "index");

-- CreateIndex
CREATE UNIQUE INDEX "AssetType_chainId_id_key" ON "AssetType"("chainId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "AssetType_chainId_codeHash_hashType_key" ON "AssetType"("chainId", "codeHash", "hashType");

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_chainId_blockNumber_fkey" FOREIGN KEY ("chainId", "blockNumber") REFERENCES "Block"("chainId", "number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Output" ADD CONSTRAINT "Output_chainId_txHash_fkey" FOREIGN KEY ("chainId", "txHash") REFERENCES "Transaction"("chainId", "hash") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_chainId_assetTypeId_fkey" FOREIGN KEY ("chainId", "assetTypeId") REFERENCES "AssetType"("chainId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
