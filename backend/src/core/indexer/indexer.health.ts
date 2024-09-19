import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import * as Sentry from '@sentry/nestjs';
import { PrismaService } from '../database/prisma/prisma.service';
import { BlockchainServiceFactory } from '../blockchain/blockchain.factory';
import { CKB_CHAIN_ID, CKB_MIN_SAFE_CONFIRMATIONS } from 'src/constants';
import { IndexerQueueService } from './indexer.queue';

export enum IndexerHealthIndicatorKey {
  Transaction = 'indexer.transaction',
  Asset = 'indexer.asset',
}

@Injectable()
export class IndexerHealthIndicator extends HealthIndicator {
  constructor(
    private prismaService: PrismaService,
    private blockchainServiceFactory: BlockchainServiceFactory,
    private indexerQueueService: IndexerQueueService,
  ) {
    super();
  }

  public async isHealthy(key: IndexerHealthIndicatorKey): Promise<HealthIndicatorResult> {
    try {
      let isHealthy = false;
      let result: HealthIndicatorResult = {};

      switch (key) {
        case IndexerHealthIndicatorKey.Asset:
          const assetHealthy = await this.isAssetIndexerHealthy();
          isHealthy = assetHealthy.isHealthy;
          result = assetHealthy.result;
          break;
        case IndexerHealthIndicatorKey.Transaction:
          const healthy = await this.isTransactionIndexerHealthy();
          isHealthy = healthy.isHealthy;
          result = healthy.result;
          break;
        default:
          throw new HealthCheckError(`Unknown health indicator key`, key);
      }

      if (isHealthy) {
        return result;
      }
      throw new HealthCheckError('IndexerService failed', result);
    } catch (e) {
      Sentry.captureException(e);
      throw new HealthCheckError('IndexerService failed', e);
    }
  }

  private async isAssetIndexerHealthy(): Promise<{
    isHealthy: boolean;
    result: HealthIndicatorResult;
  }> {
    const blockchainService = this.blockchainServiceFactory.getService(CKB_CHAIN_ID);
    const tipBlockNumber = await blockchainService.getTipBlockNumber();
    const targetBlockNumber = tipBlockNumber - CKB_MIN_SAFE_CONFIRMATIONS;
    const currentBlockNumber = await this.indexerQueueService.getLatestIndexedBlock(CKB_CHAIN_ID);

    const isHealthy = !!currentBlockNumber && currentBlockNumber >= targetBlockNumber - 2;
    const result = this.getStatus('indexer.asset', isHealthy, {
      targetBlockNumber,
      currentBlockNumber,
    });
    return {
      isHealthy,
      result,
    };
  }

  private async isTransactionIndexerHealthy(): Promise<{
    isHealthy: boolean;
    result: HealthIndicatorResult;
  }> {
    const blockchainService = this.blockchainServiceFactory.getService(CKB_CHAIN_ID);
    const tipBlockNumber = await blockchainService.getTipBlockNumber();
    const targetBlockNumber = tipBlockNumber - CKB_MIN_SAFE_CONFIRMATIONS;

    const block = await this.prismaService.block.findFirst({
      where: {
        chainId: CKB_CHAIN_ID,
      },
      orderBy: {
        number: 'desc',
      },
    });

    const isHealthy = !!block && block.number >= targetBlockNumber - 2;
    const result = this.getStatus('indexer.transaction', isHealthy, {
      targetBlockNumber,
      currentBlockNumber: block?.number,
    });
    return {
      isHealthy,
      result,
    };
  }
}
