import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './core/database/prisma/prisma.service';
import { BlockchainServiceFactory } from './core/blockchain/blockchain.factory';
import { Chain } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { IndexerServiceFactory } from './core/indexer/indexer.factory';
import cluster from 'node:cluster';

@Injectable()
export class BootstrapService {
  private readonly logger = new Logger(BootstrapService.name);
  private readonly batchSize: number;

  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
    private blockchainServiceFactory: BlockchainServiceFactory,
    private indexerServiceFactory: IndexerServiceFactory,
  ) {
    this.batchSize = this.configService.get<number>('BOOTSTRAP_BATCH_SIZE', 100);
  }

  public async bootstrap(): Promise<void> {
    this.logger.log('Indexer service is bootstrapping');
    const chains = await this.prismaService.chain.findMany();
    if (cluster.isPrimary) {
      await Promise.all(chains.map((chain) => this.bootstrapChain(chain)));
    }
  }

  private async bootstrapChain(chain: Chain): Promise<void> {
    const blockchainService = await this.blockchainServiceFactory.getService(chain.id);
    const tipBlockNumber = await blockchainService.getTipBlockNumber();
    const latestIndexedBlock = await this.prismaService.block.findFirst({
      where: { chainId: chain.id },
      orderBy: { number: 'desc' },
    });

    let startBlockNumber = latestIndexedBlock ? latestIndexedBlock.number + 1 : chain.startBlock;
    this.logger.log(
      `Bootstrapping chain ${chain.id}, tip: ${tipBlockNumber}, start: ${startBlockNumber}`,
    );
    await this.indexBlocksRecursively(chain.id, startBlockNumber, tipBlockNumber);
  }

  private async indexBlocksRecursively(
    chainId: number,
    currentBlockNumber: number,
    tipBlockNumber: number,
  ): Promise<void> {
    if (currentBlockNumber > tipBlockNumber) {
      this.logger.log(`Finished indexing chain ${chainId}`);
      return;
    }

    const indexerService = await this.indexerServiceFactory.getService(chainId);
    const endBlock = Math.min(currentBlockNumber + this.batchSize - 1, tipBlockNumber);

    try {
      await indexerService.indexBlocks(currentBlockNumber, endBlock);
      // add a delay to avoid overwhelming the node
      await new Promise((resolve) => setTimeout(resolve, 100));
      // await this.indexBlocksRecursively(chainId, endBlock + 1, tipBlockNumber);
    } catch (error) {
      this.logger.error(
        `Error indexing blocks from ${currentBlockNumber} to ${endBlock} for chain ${chainId}:`,
        error,
      );
      // TODO: handle error and retry
      throw error;
    }
  }
}
