import { Chain } from '@prisma/client';
import { IndexerAssetsFlow } from './flow/assets.flow';
import { BlockchainService } from '../blockchain/blockchain.service';
import { PrismaService } from '../database/prisma/prisma.service';
import { IndexerQueueService } from './indexer.queue';
import { IndexerTransactionsFlow } from './flow/transactions.flow';
import { SchedulerRegistry } from '@nestjs/schedule';

export class IndexerService {
  public assetsFlow: IndexerAssetsFlow;
  public transactionsFlow: IndexerTransactionsFlow;

  constructor(
    private chain: Chain,
    private blockchainService: BlockchainService,
    private prismaService: PrismaService,
    private indexerQueueService: IndexerQueueService,
  ) {
    this.assetsFlow = new IndexerAssetsFlow(
      this.chain,
      this.blockchainService,
      this.prismaService,
      this.indexerQueueService,
    );
    this.transactionsFlow = new IndexerTransactionsFlow(
      this.chain,
      this.blockchainService,
      this.prismaService,
      this.indexerQueueService,
    );
  }

  public async start() {
    await this.indexerQueueService.moveActiveJobToDelay();
    await Promise.all([
      this.assetsFlow.start(),
      this.transactionsFlow.start(),
    ]);
  }

  public async close() {
    this.blockchainService.close();
  }
}
