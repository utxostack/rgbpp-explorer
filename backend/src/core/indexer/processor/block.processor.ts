import { Chain } from '@prisma/client';
import * as BlockchainInterface from '../../blockchain/blockchain.interface';
import { BaseProcessor } from './base.processor';
import { compactToDifficulty } from 'src/common/ckb/difficulty';
import { BI } from '@ckb-lumos/bi';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma/prisma.service';

export interface IndexerBlockJobData {
  chain: Chain;
  block: BlockchainInterface.Block;
}

@Injectable()
export class BlockProcessor extends BaseProcessor<IndexerBlockJobData> {
  private logger = new Logger(BlockProcessor.name);

  constructor(
    private prismaService: PrismaService,
  ) {
    super();
  }

  public async process(data: IndexerBlockJobData): Promise<void> {
    const { chain, block } = data;
    this.logger.debug(`Processing block ${block.header.hash} for chain ${chain.name}`);

    const number = BI.from(block.header.number).toNumber();
    const difficulty = compactToDifficulty(block.header.compact_target).toBigInt();
    const timestamp = new Date(BI.from(block.header.timestamp).toNumber());

    await this.prismaService.block.create({
      data: {
        chainId: chain.id,
        number,
        hash: block.header.hash,
        transactionsCount: block.transactions.length,
        timestamp,
        difficulty,
        // TODO: implement fees and size
        totalFee: 0,
        minFee: 0,
        maxFee: 0,
        size: 0,
      },
    });
  }
}
