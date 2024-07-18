import { Module } from '@nestjs/common';
import { BitcoinApiService } from './bitcoin-api.service';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/env';

@Module({
  providers: [BitcoinApiService],
  exports: [BitcoinApiService],
})
export class BitcoinApiModule {
  constructor(private bitcoinAPIService: BitcoinApiService, private configService: ConfigService<Env>) {
    const network = this.configService.get('NETWORK');
    this.bitcoinAPIService.checkNetwork(network);
  }
}
