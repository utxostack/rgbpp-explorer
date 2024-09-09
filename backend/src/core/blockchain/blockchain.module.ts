import { Global, Module } from '@nestjs/common';
import { BlockchainServiceFactory } from './blockchain.factory';

@Global()
@Module({
  providers: [BlockchainServiceFactory],
  exports: [BlockchainServiceFactory],
})
export class BlockchainModule { }
