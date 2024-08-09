import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { CkbExplorerService } from './ckb-explorer.service';

@Injectable()
export class CkbExplorerHealthIndicator extends HealthIndicator {
  constructor(
    private ckbExplorerService: CkbExplorerService,
    @InjectSentry() private sentryService: SentryService,
  ) {
    super();
  }

  public async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      const stats = await this.ckbExplorerService.getStatistics();
      const isHealthy = !!stats.data.attributes.tip_block_number;
      const result = this.getStatus('ckb-explorer', isHealthy, {
        stats: stats.data.attributes,
      });
      if (isHealthy) {
        return result;
      }
      throw new HealthCheckError('CkbExplorerService failed', result);
    } catch (e) {
      this.sentryService.instance().captureException(e);
      throw new HealthCheckError('CkbExplorerService failed', e);
    }
  }
}
