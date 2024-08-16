import { Job } from 'bullmq';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { PrismaService } from '../../database/prisma/prisma.service';
import * as BlockchainInterface from '../../blockchain/blockchain.interface';
import { BI } from '@ckb-lumos/bi';
import { Logger } from '@nestjs/common';
import { Chain } from '@prisma/client';
import { BlockchainServiceFactory } from 'src/core/blockchain/blockchain.factory';
import { compactToDifficulty } from 'src/common/ckb/difficulty';

export const INDEXER_BLOCK_QUEUE = 'indexer-block-queue';

export interface IndexerBlockJobData {
  chain: Chain;
  block: BlockchainInterface.Block;
}

@Processor(INDEXER_BLOCK_QUEUE, {
  concurrency: 10,
})
export class IndexerBlockProcessor extends WorkerHost {
  private logger = new Logger(IndexerBlockProcessor.name);

  constructor(
    private prismaService: PrismaService,
    private blockchainServiceFactory: BlockchainServiceFactory,
  ) {
    super();
  }

  public async process(job: Job<IndexerBlockJobData>): Promise<any> {
    const { chain, block } = job.data;
    this.logger.log(`Processing block ${block.header.number} for chain ${chain.name}`);

    const number = BI.from(block.header.number).toNumber();
    // TODO: reorg handling

    const { totalFee, minFee, maxFee } = await this.calculateBlockFees(chain, block);
    const difficulty = compactToDifficulty(block.header.compact_target).toBigInt();
    const timestamp = new Date(BI.from(block.header.timestamp).toNumber());

    const newBlock = await this.prismaService.block.create({
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
    this.logger.log(`Block ${block.header.number} for chain ${chain.name} processed`);
    return newBlock;
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
    const fees = await Promise.all(txs.map((tx) => this.calculateTransactionFee(chain, tx)));

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

  public async calculateTransactionFee(
    chain: Chain,
    tx: BlockchainInterface.Transaction,
  ): Promise<number> {
    let inputCapacity = BI.from(0);
    let outputCapacity = BI.from(0);

    const blockchainService = await this.blockchainServiceFactory.getService(chain.id);
    for (const input of tx.inputs) {
      const previousTx = await blockchainService.getTransaction(input.previous_output.tx_hash);
      const ouputIndex = BI.from(input.previous_output.index).toNumber();
      const output = previousTx.transaction.outputs[ouputIndex];
      inputCapacity = inputCapacity.add(BI.from(output.capacity));
    }
    for (const output of tx.outputs) {
      outputCapacity = outputCapacity.add(BI.from(output.capacity));
    }

    return inputCapacity.sub(outputCapacity).toNumber();
  }
}
