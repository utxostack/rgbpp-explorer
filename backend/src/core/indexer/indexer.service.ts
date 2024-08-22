import { Logger } from '@nestjs/common';
import { Chain } from '@prisma/client';
import { BI } from '@ckb-lumos/bi';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Queue } from 'bullmq';

export class IndexerService {
  private readonly logger = new Logger(IndexerService.name);

  constructor(
    private chain: Chain,
    private blockchainService: BlockchainService,
    private indexerBlockQueue: Queue,
  ) {}

  public async indexBlocks(startBlock: number, endBlock: number) {
    this.logger.log(
      `Indexing blocks for chain ${this.chain.id}, from ${startBlock} to ${endBlock}`,
    );
    const jobs = await Promise.all(
      Array.from({ length: endBlock - startBlock + 1 }, async (_, i) => {
        const block = await this.blockchainService.getBlockByNumber(
          BI.from(startBlock + i).toHexString(),
        );
        const blockNumber = BI.from(block.header.number).toNumber();

        return {
          name: block.header.hash,
          data: {
            block,
            chain: this.chain,
          },
          opts: {
            jobId: block.header.hash,
            // the priorities go from 1 to 2 097 152
            // where a lower number is always a higher priority than higher numbers.
            priority: Math.max(1, 2097152 - (blockNumber % 2097152)),
            delay: (i / endBlock) * 1000,
          },
        };
      }),
    );
    await this.indexerBlockQueue.addBulk(jobs);
  }

  public async close() {
    await this.blockchainService.close();
  }
}
