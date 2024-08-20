import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { CkbExplorerModule } from './ckb-explorer/ckb-explorer.module';
import { BitcoinApiModule } from './bitcoin-api/bitcoin-api.module';
import { CkbRpcModule } from './ckb-rpc/ckb-rpc.module';
import { HealthModule } from './health/health.module';
import { IndexerModule } from './indexer/indexer.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { RgbppCoreModule } from './rgbpp/rgbpp.module';

@Module({
  imports: [
    DatabaseModule,
    CkbExplorerModule,
    CkbRpcModule,
    BitcoinApiModule,
    HealthModule,
    IndexerModule,
    BlockchainModule,
    RgbppCoreModule,
  ],
})
export class CoreModule { }
