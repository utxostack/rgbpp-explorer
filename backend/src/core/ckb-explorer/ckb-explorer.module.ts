import { Module } from '@nestjs/common';
import { CkbExplorerService } from './ckb-explorer.service';
import { CkbRpcWebsocketService } from '../ckb-rpc/ckb-rpc-websocket.service';

@Module({
  imports: [CkbRpcWebsocketService],
  providers: [CkbExplorerService],
  exports: [CkbExplorerService],
})
export class CkbExplorerModule {}
