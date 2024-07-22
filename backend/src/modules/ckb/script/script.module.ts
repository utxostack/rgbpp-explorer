import { Module } from '@nestjs/common';
import { CkbScriptResolver } from './script.resolver';

@Module({
  imports: [],
  providers: [CkbScriptResolver],
})
export class CkbScriptModule {}
