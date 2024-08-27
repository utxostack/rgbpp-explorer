import { Injectable, Logger } from '@nestjs/common';
import { Chain } from '@prisma/client';
import * as BlockchainInterface from '../../blockchain/blockchain.interface';
import { BaseProcessor } from './base.processor';
import { RgbppCoreService } from 'src/core/rgbpp/rgbpp.service';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { BI, HashType, Script } from '@ckb-lumos/lumos';
import { computeScriptHash } from '@ckb-lumos/lumos/utils';

export interface IndexerOutputData {
  chain: Chain;
  txHash: string;
  index: string;
  output: BlockchainInterface.Output;
}

@Injectable()
export class OutputProcessor extends BaseProcessor<IndexerOutputData> {
  private logger = new Logger(OutputProcessor.name);

  constructor(
    private prismaService: PrismaService,
    private rgbppCoreService: RgbppCoreService,
  ) {
    super();
  }

  public async process(data: IndexerOutputData): Promise<void> {
    const { chain, txHash, index, output } = data;
    this.logger.debug(
      `Processing output ${index} of transaction ${txHash} for chain ${chain.name}`,
    );

    const typeScript: Script | null = output.type
      ? {
        codeHash: output.type.code_hash,
        hashType: output.type.hash_type as HashType,
        args: output.type.args,
      }
      : null;
    const typeScriptHash = typeScript ? computeScriptHash(typeScript) : null;

    const lockScript: Script = {
      codeHash: output.lock.code_hash,
      hashType: output.lock.hash_type as HashType,
      args: output.lock.args,
    };
    const lockScriptHash = computeScriptHash(lockScript);

    let rgbppBound = await this.isRgbppBoundOutput(output);
    let boundBtcTxId: string | undefined;
    let boundBtcTxIndex: number | undefined;
    if (rgbppBound) {
      try {
        const lockArgs = this.rgbppCoreService.parseRgbppLockArgs(output.lock.args);
        boundBtcTxId = lockArgs.btcTxid;
        boundBtcTxIndex = lockArgs.outIndex;
      } catch (error) {
        rgbppBound = false;
        this.logger.error(
          `Failed to parse RGBPP lock args for output ${index} of transaction ${txHash} for chain ${chain.name}`,
        );
      }
    }

    await this.prismaService.output.upsert({
      where: {
        chainId_txHash_index: {
          chainId: chain.id,
          txHash,
          index,
        },
      },
      update: {},
      create: {
        chainId: chain.id,
        txHash,
        index,
        capacity: BI.from(output.capacity).toBigInt(),
        typeScriptHash,
        lockScriptHash,
        isLive: true,
        rgbppBound,
        boundBtcTxId,
        boundBtcTxIndex,
      },
    });
  }

  public async isRgbppBoundOutput(output: BlockchainInterface.Output): Promise<boolean> {
    const lockScript: Script = {
      codeHash: output.lock.code_hash,
      hashType: output.lock.hash_type as HashType,
      args: output.lock.args,
    };
    return this.rgbppCoreService.isRgbppLockScript(lockScript);
  }
}
