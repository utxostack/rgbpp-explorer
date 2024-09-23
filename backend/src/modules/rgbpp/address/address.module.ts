import { forwardRef, Module } from '@nestjs/common';
import { RgbppAddressResolver } from './address.resolver';
import { CkbExplorerModule } from 'src/core/ckb-explorer/ckb-explorer.module';
import { BitcoinApiModule } from 'src/core/bitcoin-api/bitcoin-api.module';
import { CkbRpcModule } from 'src/core/ckb-rpc/ckb-rpc.module';
import { RgbppModule } from '../rgbpp.module';
import { CkbTransactionModule } from 'src/modules/ckb/transaction/transaction.module';
import { BullModule } from '@nestjs/bullmq';
import { RgbppAddressService } from './address.service';

@Module({
  imports: [
    CkbExplorerModule,
    BitcoinApiModule,
    CkbRpcModule,
    CkbTransactionModule,
    forwardRef(() => RgbppModule),
    BullModule.registerQueue({
      name: 'rgbpp-address',
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      },
    }),
  ],
  providers: [RgbppAddressResolver, RgbppAddressService],
})
export class RgbppAddressModule {}
