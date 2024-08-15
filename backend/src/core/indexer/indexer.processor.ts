import { Job } from 'bullmq';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { PrismaService } from '../database/prisma/prisma.service';
import * as BlockchainInterface from '../blockchain/blockchain.interface';
import { BI } from '@ckb-lumos/bi';
import { Logger } from '@nestjs/common';
import { Chain } from '@prisma/client';

export const INDEXER_QUEUE_NAME = 'indexer-queue';

export enum IndexerJobType {
  Block = 'block',
}

@Processor(INDEXER_QUEUE_NAME, {
  concurrency: 1,
})
export class IndexerProcessor extends WorkerHost {
  private logger = new Logger(IndexerProcessor.name);

  constructor(private prismaService: PrismaService) {
    super();
  }

  public async process(job: Job): Promise<any> {
    const [jobType] = job.name.split('/');
    switch (jobType) {
      case IndexerJobType.Block: {
        const { chain, block } = job.data;
        await this.processBlock(chain, block);
      }
    }
  }

  private async processBlock(chain: Chain, block: BlockchainInterface.Block) {
    this.logger.log(`Processing block ${block.header.number} for chain ${chain.name}`);
    await this.prismaService.block.create({
      data: {
        chainId: chain.id,
        number: BI.from(block.header.number).toNumber(),
        hash: block.header.hash,
        timestamp: new Date(BI.from(block.header.timestamp).toNumber()),
        transactionsCount: block.transactions.length,
        size: 0,
        totalFee: 0,
        minFee: 0,
        maxFee: 0,
        difficulty: 0,
      },
    });
  }
}
