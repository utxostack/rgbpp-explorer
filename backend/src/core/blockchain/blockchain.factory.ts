import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { PrismaService } from '../database/prisma/prisma.service';
import { Env } from 'src/env';
import { ConfigService } from '@nestjs/config';

export class BlockchainServiceFactoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BlockchainServiceFactoryError';
  }
}

@Injectable()
export class BlockchainServiceFactory implements OnModuleDestroy {
  private services: Map<number, BlockchainService> = new Map();

  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService<Env>,
    @InjectSentry() private sentryService: SentryService,
  ) {}

  public async getService(chainId: number): Promise<BlockchainService> {
    const chain = await this.prismaService.chain.findUnique({
      where: { id: chainId },
    });
    if (!chain) {
      throw new BlockchainServiceFactoryError(`Chain with ID ${chainId} not found`);
    }

    if (!this.services.has(chain.id)) {
      if (!chain.ws) {
        throw new BlockchainServiceFactoryError(
          `Chain with ID ${chainId} does not have a WebSocket URL`,
        );
      }
      this.services.set(
        chainId,
        new BlockchainService(chainId, chain.ws, this.configService, this.sentryService),
      );
    }
    return this.services.get(chainId)!;
  }

  async onModuleDestroy() {
    for (const service of this.services.values()) {
      await service.close();
    }
  }
}
