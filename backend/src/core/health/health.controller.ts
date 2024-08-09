import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { CkbRpcHealthIndicator, CkbRpcHealthIndicatorKey } from '../ckb-rpc/ckb-rpc-websocket.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private ckbRpcHealthIndicator: CkbRpcHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.ckbRpcHealthIndicator.isHealthy(CkbRpcHealthIndicatorKey.Websocket),
    ]);
  }
}
