import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { IndexerService } from './indexer.service';
import { BlockchainServiceFactory } from '../blockchain/blockchain.factory';
import { IndexerQueueService } from './indexer.queue';
import { ModuleRef } from '@nestjs/core';

export class IndexerServiceFactoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IndexerServiceFactoryError';
  }
}

@Injectable()
export class IndexerServiceFactory implements OnModuleDestroy {
  private services: Map<number, IndexerService> = new Map();

  constructor(
    private blockchainServiceFactory: BlockchainServiceFactory,
    private prismaService: PrismaService,
    private moduleRef: ModuleRef,
  ) {}

  public async onModuleDestroy() {
    for (const service of this.services.values()) {
      await service.close();
    }
  }

  public async getService(chainId: number): Promise<IndexerService> {
    const chain = await this.prismaService.chain.findUnique({
      where: { id: chainId },
    });
    if (!chain) {
      throw new IndexerServiceFactoryError(`Chain with ID ${chainId} not found`);
    }
    if (!this.services.has(chain.id)) {
      const indexerQueueService = this.moduleRef.get(IndexerQueueService);
      const blockchainService = this.blockchainServiceFactory.getService(chain.id);
      const service = new IndexerService(
        chain,
        blockchainService,
        this.prismaService,
        indexerQueueService,
      );
      this.services.set(chain.id, service);
    }
    return this.services.get(chain.id)!;
  }
}
