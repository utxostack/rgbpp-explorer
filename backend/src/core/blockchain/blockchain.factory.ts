import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { PrismaService } from '../database/prisma/prisma.service';

export class ChainServiceFactoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BlockchainServiceFactoryError';
  }
}

@Injectable()
export class BlockchainServiceFactory implements OnModuleDestroy {
  private services: Map<number, BlockchainService> = new Map();

  constructor(private prismaService: PrismaService) { }

  public getService(chainId: number): BlockchainService {
    const chainPromise = this.prismaService.chain.findUnique({
      where: { id: chainId },
    });
    if (!this.services.has(chainId)) {
      this.services.set(chainId, new BlockchainService(chainId, chainPromise));
    }
    return this.services.get(chainId)!;
  }

  async onModuleDestroy() {
    for (const service of this.services.values()) {
      await service.close();
    }
  }
}
