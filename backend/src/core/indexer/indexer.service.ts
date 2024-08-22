import { Logger } from '@nestjs/common';
import { Chain } from '@prisma/client';
import { BI } from '@ckb-lumos/bi';
import { BlockchainService } from '../blockchain/blockchain.service';
import { JobsOptions, Queue } from 'bullmq';

export class IndexerService {
  private readonly logger = new Logger(IndexerService.name);

  constructor(
    private chain: Chain,
    private blockchainService: BlockchainService,
    private indexerBlockQueue: Queue,
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
        return this.createJobForBlock(blockNumber, index, endBlock);
      }),
    );
    await this.indexerBlockQueue.addBulk(jobs);
  }

  private async createJobForBlock(blockNumber: number, index: number, totalBlocks: number) {
    const block = await this.blockchainService.getBlockByNumber(BI.from(blockNumber).toHexString());
    return {
      name: block.header.hash,
      data: { block, chain: this.chain },
      opts: this.createJobOptions(block, index, totalBlocks),
    };
  }

  private createJobOptions(block: any, index: number, totalBlocks: number): JobsOptions {
    const blockNumber = BI.from(block.header.number).toNumber();
    return {
      jobId: block.header.hash,
      priority: this.calculatePriority(blockNumber),
      delay: this.calculateDelay(index, totalBlocks),
    };
  }

  private calculatePriority(blockNumber: number): number {
    const MAX_PRIORITY = 2097152;
    return Math.max(1, MAX_PRIORITY - (blockNumber % MAX_PRIORITY));
  }

  private calculateDelay(index: number, totalBlocks: number): number {
    return (index / totalBlocks) * 1000;
  }
}
