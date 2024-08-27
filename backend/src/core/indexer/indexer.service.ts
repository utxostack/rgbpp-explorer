import { Logger } from '@nestjs/common';
import { Chain } from '@prisma/client';
import { BI } from '@ckb-lumos/bi';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Queue } from 'bullmq';

const MAX_BULLMQ_JOB_PRIORITY = 2097152;

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
      opts: {
        jobId: block.header.hash,
        priority: this.getBlockJobPriority(blockNumber),
      },
    };
  }

  private getBlockJobPriority(blockNumber: number) {
    // We use the block number as the priority, so that the jobs are processed in order
    // bullmq only supports 32-bit signed integers as priority, so we need to wrap around
    return (blockNumber + 1) % MAX_BULLMQ_JOB_PRIORITY;
  }
}
