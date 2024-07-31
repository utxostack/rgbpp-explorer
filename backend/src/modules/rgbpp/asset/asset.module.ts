import { forwardRef, Module } from '@nestjs/common';
import { AssetResolver } from './asset.resolver';
import { RgbppModule } from '../rgbpp.module';

@Module({
  imports: [forwardRef(() => RgbppModule)],
  providers: [AssetResolver],
})
export class RgbppAddressModule {}
