import { Logger } from '@nestjs/common';
import { Chain } from '@prisma/client';
import { BI } from '@ckb-lumos/bi';
import * as BlockchainInterface from '../blockchain/blockchain.interface';
import { BlockchainService } from '../blockchain/blockchain.service';
import { JobsOptions, Queue } from 'bullmq';
import { QueueJobPriority } from './indexer.queue';

export class IndexerService {
  private readonly logger = new Logger(IndexerService.name);

  constructor(
    private chain: Chain,
    private blockchainService: BlockchainService,
    private indexerQueue: Queue,
  ) {}

  public async close() {
    await this.blockchainService.close();
  }

  public async indexBlocks(startBlock: number, endBlock: number) {
    this.logger.log(
      `Indexing blocks for chain ${this.chain.id}, from ${startBlock} to ${endBlock}`,
    );
    const jobs = await Promise.all(
      Array.from({ length: endBlock - startBlock + 1 }, async (_, index) => {
        const blockNumber = startBlock + index;
        return this.createJobForBlock(blockNumber);
      }),
    );
    await this.indexerQueue.addBulk(jobs);
  }

  private async createJobForBlock(blockNumber: number) {
    const block = await this.blockchainService.getBlockByNumber(BI.from(blockNumber).toHexString());
    return {
      name: block.header.hash,
      data: { block, chain: this.chain },
      opts: this.createJobOptions(block),
    };
  }

  private createJobOptions(block: BlockchainInterface.Block): JobsOptions {
    const blockNumber = BI.from(block.header.number).toNumber();
    return {
      jobId: block.header.hash,
      priority: this.calculatePriority(blockNumber),
    };
  }

  private calculatePriority(blockNumber: number): number {
    const MAX_PRIORITY = 2097152;
    return Math.max(QueueJobPriority.Block, MAX_PRIORITY - (blockNumber % MAX_PRIORITY));
  }
}
