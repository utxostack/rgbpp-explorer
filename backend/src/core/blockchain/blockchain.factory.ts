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

  constructor(private prismaService: PrismaService) {}

  public async getService(chainId: number): Promise<BlockchainService> {
    const chain = await this.prismaService.chain.findUnique({
      where: { id: chainId },
    });
    if (!chain) {
      throw new ChainServiceFactoryError(`Chain with ID ${chainId} not found`);
    }

    if (!this.services.has(chain.id)) {
      if (!chain.ws) {
        throw new ChainServiceFactoryError(
          `Chain with ID ${chainId} does not have a WebSocket URL`,
        );
      }
      this.services.set(chainId, new BlockchainService(chainId, chain.ws));
    }
    return this.services.get(chainId)!;
  }

  async onModuleDestroy() {
    for (const service of this.services.values()) {
      await service.close();
    }
  }
}
