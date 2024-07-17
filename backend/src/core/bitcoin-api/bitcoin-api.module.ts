import { Module } from '@nestjs/common';
import { BitcoinAPIService } from './bitcoin-api.service';

@Module({
  providers: [BitcoinAPIService],
  exports: [BitcoinAPIService],
})
export class BitcoinApiModule {}
