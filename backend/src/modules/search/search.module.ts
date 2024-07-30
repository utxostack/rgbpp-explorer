import { Module } from '@nestjs/common';
import { SearchResolver } from './search.resolver';
import { CkbExplorerModule } from 'src/core/ckb-explorer/ckb-explorer.module';

@Module({
  imports: [CkbExplorerModule],
  providers: [SearchResolver],
  exports: [],
})
export class SearchModule {}
