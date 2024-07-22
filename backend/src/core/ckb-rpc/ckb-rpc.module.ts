import { Module } from '@nestjs/common';
import { CkbRpcWebsocketService } from './ckb-rpc-websocket.service';

@Module({
  providers: [CkbRpcWebsocketService],
  exports: [CkbRpcWebsocketService],
})
export class CkbRpcModule {}
