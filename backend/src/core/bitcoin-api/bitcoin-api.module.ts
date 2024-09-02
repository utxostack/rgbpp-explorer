import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BitcoinApiService } from './bitcoin-api.service';
import { Env } from 'src/env';
import { BitcoinApiHealthIndicator } from './bitcoin-api.health';

@Global()
@Module({
  providers: [BitcoinApiService, BitcoinApiHealthIndicator],
  exports: [BitcoinApiService, BitcoinApiHealthIndicator],
})
export class BitcoinApiModule {
  constructor(
    private bitcoinAPIService: BitcoinApiService,
    private configService: ConfigService<Env>,
  ) {
    const network = this.configService.get('NETWORK');
    this.bitcoinAPIService.checkNetwork(network);
  }
}
