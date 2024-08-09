import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { CkbRpcModule } from '../ckb-rpc/ckb-rpc.module';

@Module({
  imports: [TerminusModule, CkbRpcModule],
  providers: [HealthController],
  controllers: [HealthController],
})
export class HealthModule {}
