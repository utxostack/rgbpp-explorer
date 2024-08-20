import { Global, Module } from '@nestjs/common';
import { RgbppCoreService } from './rgbpp.service';

@Global()
@Module({
  providers: [RgbppCoreService],
  exports: [RgbppCoreService],
})
export class RgbppCoreModule { }
