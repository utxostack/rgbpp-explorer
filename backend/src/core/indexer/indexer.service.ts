import { Logger } from '@nestjs/common';
import { Chain } from '@prisma/client';
import { BI } from '@ckb-lumos/bi';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Queue } from 'bullmq';
import { IndexerJobType } from './indexer.processor';

export class IndexerService {
  private readonly logger = new Logger(IndexerService.name);

  constructor(
    private chain: Chain,
    private blockchainService: BlockchainService,
    private indexerQueue: Queue,
  ) {}

  public async indexBlocks(startBlock: number, endBlock: number) {
    this.logger.log(
      `Indexing blocks for chain ${this.chain.id}, from ${startBlock} to ${endBlock}`,
    );
    await Promise.all(
      Array.from({ length: endBlock - startBlock + 1 }, async (_, i) => {
        const block = await this.blockchainService.getBlockByNumber(
          BI.from(startBlock + i).toHexString(),
        );
        const jobId = `${IndexerJobType.Block}/${this.chain.id}/${block.header.number}`;
        await this.indexerQueue.add(
          jobId,
          {
            block,
            chain: this.chain,
          },
          {
            jobId,
            // the priorities go from 1 to 2 097 152
            // where a lower number is always a higher priority than higher numbers.
            priority: (BI.from(block.header.number).toNumber() % 2097152) + 1,
          },
        );
      }),
    );
  }

  public async close() {
    await this.blockchainService.close();
  }
}
