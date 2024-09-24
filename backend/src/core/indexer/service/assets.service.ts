import { BI, HashType, Script } from '@ckb-lumos/lumos';
import { computeScriptHash } from '@ckb-lumos/lumos/utils';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { AssetType, PrismaClient } from '@prisma/client';
import { ITXClientDenyList } from '@prisma/client/runtime/library';
import { Cell } from 'src/core/blockchain/blockchain.interface';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { IndexerQueueService } from '../indexer.queue';
import { leToU128, remove0x } from '@rgbpp-sdk/ckb';

@Injectable()
export class IndexerAssetsService {
  constructor(
    private prismaService: PrismaService,
    private moduleRef: ModuleRef,
  ) { }

  public async processAssetCell(
    chainId: number,
    cell: Cell,
    assetType: AssetType,
    tx: PrismaService | Omit<PrismaClient, ITXClientDenyList> = this.prismaService,
  ) {
    const { out_point, output, block_number } = cell;
    const indexerQueueService = this.moduleRef.get(IndexerQueueService);
    const lockScript: Script = {
      codeHash: output.lock.code_hash,
      hashType: output.lock.hash_type as HashType,
      args: output.lock.args,
    };
    await indexerQueueService.addLockJob({
      chainId,
      script: lockScript,
    });

    const typeScript: Script = {
      codeHash: output.type!.code_hash,
      hashType: output.type!.hash_type as HashType,
      args: output.type!.args,
    };
    await indexerQueueService.addTypeJob({
      chainId,
      script: typeScript,
    });

    const amount = assetType.fungible
      ? BI.from(leToU128(remove0x(cell.output_data).slice(0, 32))).toString()
      : 1;

    const data = {
      chainId,
      blockNumber: BI.from(block_number).toNumber(),
      amount,
      txHash: out_point.tx_hash,
      index: out_point.index,
      lockScriptHash: computeScriptHash(lockScript),
      typeScriptHash: computeScriptHash(typeScript),
      assetTypeId: assetType.id,
    };

    return tx.asset.upsert({
      where: {
        chainId_txHash_index: {
          chainId,
          txHash: out_point.tx_hash,
          index: out_point.index,
        },
      },
      create: data,
      update: {},
    });
  }
}
