import { Module } from '@nestjs/common';
import { SearchResolver } from './search.resolver';

@Module({
  imports: [],
  providers: [SearchResolver],
  exports: [],
})
export class SearchModule {}
