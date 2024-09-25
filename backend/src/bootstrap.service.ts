import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './core/database/prisma/prisma.service';
import { IndexerServiceFactory } from './core/indexer/indexer.factory';
import cluster from 'node:cluster';

@Injectable()
export class BootstrapService {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(
    private prismaService: PrismaService,
    private IndexerServiceFactory: IndexerServiceFactory,
  ) { }

  public async bootstrap() {
    if (cluster.isPrimary) {
      cluster.fork();
      cluster.on('exit', (worker, code, signal) => {
        this.logger.error(
          `Worker ${worker.process.pid} died with code ${code} and signal ${signal}`,
        );
        this.logger.log('Starting a new worker');
        cluster.fork();
      });
    } else {
      await this.bootstrapAssetsIndex();
    }
  }

  public async bootstrapAssetsIndex() {
    const chains = await this.prismaService.chain.findMany();
    for (const chain of chains) {
      this.logger.log(`Indexing assets for chain ${chain.name}`);
      const indexerService = await this.IndexerServiceFactory.getService(chain.id);
      await indexerService.start();
    }
  }
}
