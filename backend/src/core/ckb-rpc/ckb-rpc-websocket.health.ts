import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { CkbRpcWebsocketService } from './ckb-rpc-websocket.service';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';

export enum CkbRpcHealthIndicatorKey {
  Websocket = 'ckb-rpc-websocket',
}

@Injectable()
export class CkbRpcHealthIndicator extends HealthIndicator {
  constructor(
    private ckbRpcWebsocketService: CkbRpcWebsocketService,
    @InjectSentry() private sentryService: SentryService,
  ) {
    super();
  }

  public async isHealthy(key: CkbRpcHealthIndicatorKey): Promise<HealthIndicatorResult> {
    try {
      let isHealthy = false;
      let result: HealthIndicatorResult = {};

      switch (key) {
        case CkbRpcHealthIndicatorKey.Websocket:
          const { isHealthy: websocketIsHealthy, result: websocketResult } =
            await this.isWebsocketHealthy();
          isHealthy = websocketIsHealthy;
          result = websocketResult;
          break;
        default:
          throw new HealthCheckError(`Unknown health indicator key`, key);
      }

      if (isHealthy) {
        return result;
      }
      throw new HealthCheckError('CkbRpcWebsocketService failed', result);
    } catch (e) {
      this.sentryService.instance().captureException(e);
      throw new HealthCheckError('CkbRpcWebsocketService failed', e);
    }
  }

  private async isWebsocketHealthy(): Promise<{
    isHealthy: boolean;
    result: HealthIndicatorResult;
  }> {
    const tipBlockNumber = await this.ckbRpcWebsocketService.getTipBlockNumber();
    const isHealthy = !!tipBlockNumber;
    const result = this.getStatus('ckb-rpc.websocket', isHealthy, { tipBlockNumber });
    return {
      isHealthy,
      result,
    };
  }
}
