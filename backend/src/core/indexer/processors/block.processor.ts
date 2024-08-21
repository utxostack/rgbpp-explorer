import { Job, Queue } from 'bullmq';
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { PrismaService } from '../../database/prisma/prisma.service';
import * as BlockchainInterface from '../../blockchain/blockchain.interface';
import { BI } from '@ckb-lumos/bi';
import { Logger } from '@nestjs/common';
import { Chain } from '@prisma/client';
import { compactToDifficulty } from 'src/common/ckb/difficulty';
import { INDEXER_TRANSACTION_QUEUE } from './transaction.processor';
import { IndexerUtil } from '../indexer.utils';

export const INDEXER_BLOCK_QUEUE = 'indexer-block-queue';

export interface IndexerBlockJobData {
  chain: Chain;
  block: BlockchainInterface.Block;
}

@Processor(INDEXER_BLOCK_QUEUE, {
  concurrency: 100,
})
export class IndexerBlockProcessor extends WorkerHost {
  private logger = new Logger(IndexerBlockProcessor.name);

  constructor(
    private prismaService: PrismaService,
    private indexerUtil: IndexerUtil,
    @InjectQueue(INDEXER_TRANSACTION_QUEUE) private indexerTransactionQueue: Queue,
  ) {
    super();
  }

  public async process(job: Job<IndexerBlockJobData>): Promise<any> {
    const { chain, block } = job.data;
    const number = BI.from(block.header.number).toNumber();
    this.logger.log(`Processing block ${number} for chain ${chain.name}`);

    // TODO: reorg handling

    await Promise.all(
      block.transactions.map(async (transaction, index) => {
        await this.indexerTransactionQueue.add(
          transaction.hash,
          {
            chain,
            block,
            index,
          },
          {
            jobId: transaction.hash,
            // the priorities go from 1 to 2 097 152
            // where a lower number is always a higher priority than higher numbers.
            priority: (BI.from(block.header.number).toNumber() % 2097152) + 1,
          },
        );
      }),
    );

    const { totalFee, minFee, maxFee } = await this.calculateBlockFees(chain, block);
    const difficulty = compactToDifficulty(block.header.compact_target).toBigInt();
    const timestamp = new Date(BI.from(block.header.timestamp).toNumber());

    await this.prismaService.block.create({
      data: {
        chainId: chain.id,
        number,
        hash: block.header.hash,
        transactionsCount: block.transactions.length,
        timestamp,
        totalFee,
        minFee,
        maxFee,
        difficulty,
        // TODO: implement block size calculation
        size: 0,
      },
    });
    this.logger.log(`Block ${block.header.number} for chain ${chain.name} processed successfully`);
  }

  public async calculateBlockFees(
    chain: Chain,
    block: BlockchainInterface.Block,
  ): Promise<{
    totalFee: number;
    minFee: number;
    maxFee: number;
  }> {
    const [_, ...txs] = block.transactions;
    const fees = await Promise.all(
      txs.map((tx) => this.indexerUtil.calculateTransactionFee(chain, tx)),
    );

    let totalFee = 0;
    let minFee = Number.MAX_SAFE_INTEGER;
    let maxFee = 0;
    for (const fee of fees) {
      totalFee += fee;
      minFee = Math.min(minFee, fee);
      maxFee = Math.max(maxFee, fee);
    }
    return {
      totalFee,
      minFee,
      maxFee,
    };
  }
}
