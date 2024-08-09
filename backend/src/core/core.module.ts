import { Module } from '@nestjs/common';
// import { DatabaseModule } from './database/database.module';
import { CkbExplorerModule } from './ckb-explorer/ckb-explorer.module';
import { CkbExplorerService } from './ckb-explorer/ckb-explorer.service';
import { BitcoinApiModule } from './bitcoin-api/bitcoin-api.module';
import { CkbRpcModule } from './ckb-rpc/ckb-rpc.module';
import { CkbRpcWebsocketService } from './ckb-rpc/ckb-rpc-websocket.service';
import { BitcoinApiService } from './bitcoin-api/bitcoin-api.service';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // DatabaseModule,
    CkbExplorerModule,
    CkbRpcModule,
    BitcoinApiModule,
    HealthModule,
  ],
  providers: [CkbExplorerService, CkbRpcWebsocketService, BitcoinApiService],
  exports: [CkbExplorerService, CkbRpcWebsocketService, BitcoinApiService],
})
export class CoreModule {}
