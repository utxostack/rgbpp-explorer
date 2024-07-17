import { Module } from '@nestjs/common';
// import { DatabaseModule } from './database/database.module';
import { CkbExplorerModule } from './ckb-explorer/ckb-explorer.module';
import { CkbExplorerService } from './ckb-explorer/ckb-explorer.service';
import { BitcoinApiModule } from './bitcoin-api/bitcoin-api.module';
import { CkbRpcModule } from './ckb-rpc/ckb-rpc.module';
import { CkbRpcWebsocketService } from './ckb-rpc/ckb-rpc-websocket.service';
import { BitcoinAPIService } from './bitcoin-api/bitcoin-api.service';

@Module({
  imports: [
    // DatabaseModule,
    CkbExplorerModule,
    CkbRpcModule,
    BitcoinApiModule,
  ],
  providers: [CkbExplorerService, CkbRpcWebsocketService, BitcoinAPIService],
  exports: [CkbExplorerService, CkbRpcWebsocketService, BitcoinAPIService],
})
export class CoreModule { }
