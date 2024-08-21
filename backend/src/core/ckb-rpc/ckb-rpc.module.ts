import { Module } from '@nestjs/common';
import { CkbRpcHealthIndicator } from './ckb-rpc.health';
import { CkbRpcWebsocketService } from './ckb-rpc-websocket.service';

@Module({
  providers: [CkbRpcWebsocketService, CkbRpcHealthIndicator],
  exports: [CkbRpcWebsocketService, CkbRpcHealthIndicator],
})
export class CkbRpcModule {}
