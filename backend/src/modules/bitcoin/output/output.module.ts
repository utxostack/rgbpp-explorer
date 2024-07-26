import { Module } from '@nestjs/common';
import { BitcoinOutputResolver } from './output.resolver';

@Module({
  providers: [BitcoinOutputResolver],
})
export class BitcoinOutputModule {}
