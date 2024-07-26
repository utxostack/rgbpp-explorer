import { Module } from '@nestjs/common';
import { BitcoinInputResolver } from './input.resolver';

@Module({
  providers: [BitcoinInputResolver],
})
export class BitcoinInputModule {}
