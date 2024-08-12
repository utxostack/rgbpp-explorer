import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, HttpHealthIndicator } from '@nestjs/terminus';
import { CkbRpcHealthIndicator, CkbRpcHealthIndicatorKey } from '../ckb-rpc/ckb-rpc.health';
import { BitcoinApiHealthIndicator } from '../bitcoin-api/bitcoin-api.health';
import { CkbExplorerHealthIndicator } from '../ckb-explorer/ckb-explorer.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private bitcoinApiHealthIndicator: BitcoinApiHealthIndicator,
    private ckbRpcHealthIndicator: CkbRpcHealthIndicator,
    private ckbExplorerHealthIndicator: CkbExplorerHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('graphql', 'http://localhost:3000/graphql'),
      () => this.bitcoinApiHealthIndicator.isHealthy(),
      () => this.ckbRpcHealthIndicator.isHealthy(CkbRpcHealthIndicatorKey.Websocket),
      () => this.ckbExplorerHealthIndicator.isHealthy(),
    ]);
  }
}
