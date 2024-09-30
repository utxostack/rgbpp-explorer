import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { CkbExplorerService } from './ckb-explorer.service';
import * as Sentry from '@sentry/nestjs';

@Injectable()
export class CkbExplorerHealthIndicator extends HealthIndicator {
  constructor(private ckbExplorerService: CkbExplorerService) {
    super();
  }

  public async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      const now = performance.now();
      const stats = await this.ckbExplorerService.getStatistics();
      const isHealthy = !!stats.data.attributes.tip_block_number;
      const result = this.getStatus('ckb-explorer', isHealthy, {
        stats: stats.data.attributes,
        latency: performance.now() - now,
      });
      if (isHealthy) {
        return result;
      }
      throw new HealthCheckError('CkbExplorerService failed', result);
    } catch (e) {
      Sentry.captureException(e);
      throw new HealthCheckError('CkbExplorerService failed', e);
    }
  }
}
