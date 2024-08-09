import { Module } from '@nestjs/common';
import { CkbRpcWebsocketService } from './ckb-rpc-websocket.service';
import { CkbRpcHealthIndicator } from './ckb-rpc-websocket.health';

@Module({
  providers: [CkbRpcWebsocketService, CkbRpcHealthIndicator],
  exports: [CkbRpcWebsocketService, CkbRpcHealthIndicator],
})
export class CkbRpcModule {}
