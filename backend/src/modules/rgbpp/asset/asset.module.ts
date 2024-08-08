import { forwardRef, Module } from '@nestjs/common';
import { RgbppAssetResolver } from './asset.resolver';
import { RgbppModule } from '../rgbpp.module';

@Module({
  imports: [forwardRef(() => RgbppModule)],
  providers: [RgbppAssetResolver],
})
export class RgbppAssetModule {}
