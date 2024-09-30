import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { BitcoinApiService } from './bitcoin-api.service';
import * as Sentry from '@sentry/nestjs';

@Injectable()
export class BitcoinApiHealthIndicator extends HealthIndicator {
  constructor(private bitcoinApiService: BitcoinApiService) {
    super();
  }

  public async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      const now = performance.now();
      const info = await this.bitcoinApiService.getBlockchainInfo();
      const isHealthy = !!info.blocks;
      const result = this.getStatus('bitcoin-api', isHealthy, {
        info,
        latency: performance.now() - now,
      });
      if (isHealthy) {
        return result;
      }
      throw new HealthCheckError('BitcoinApiService failed', result);
    } catch (e) {
      Sentry.captureException(e);
      throw new HealthCheckError('BitcoinApiService failed', e);
    }
  }
}
