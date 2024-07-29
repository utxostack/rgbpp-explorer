import { Module } from '@nestjs/common';
import { RgbppAddressResolver } from './address.resolver';
import { CkbExplorerModule } from 'src/core/ckb-explorer/ckb-explorer.module';

@Module({
  imports: [CkbExplorerModule],
  providers: [RgbppAddressResolver],
})
export class RgbppAddressModule {}
