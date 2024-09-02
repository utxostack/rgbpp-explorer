import { Global, Module } from '@nestjs/common';
import { CkbRpcHealthIndicator } from './ckb-rpc.health';
import { CkbRpcWebsocketService } from './ckb-rpc-websocket.service';

@Global()
@Module({
  providers: [CkbRpcWebsocketService, CkbRpcHealthIndicator],
  exports: [CkbRpcWebsocketService, CkbRpcHealthIndicator],
})
export class CkbRpcModule {}
