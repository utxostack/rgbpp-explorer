import { Injectable, Logger } from '@nestjs/common';
import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import { CkbBlockService } from './block.service';
import * as CkbExplorer from 'src/core/ckb-explorer/ckb-explorer.interface';

export type CkbBlockLoaderResponse = CkbExplorer.Block;

@Injectable()
export class CkbBlockLoader implements NestDataLoader<string, CkbExplorer.Block> {
  private logger = new Logger(CkbBlockLoader.name);

  constructor(private blockService: CkbBlockService) {}

  public getBatchFunction() {
    return (heightOrHashList: string[]) => {
      this.logger.debug(`Loading blocks: ${heightOrHashList.join(', ')}`);
      return Promise.all(
        heightOrHashList.map((heightOrHash) => this.blockService.getBlock(heightOrHash)),
      );
    };
  }
}

export type CkbBlockTransactionsLoaderResponse = CkbExplorer.Transaction[];

@Injectable()
export class CkbBlockTransactionsLoader
  implements NestDataLoader<string, CkbBlockTransactionsLoaderResponse>
{
  private logger = new Logger(CkbBlockTransactionsLoader.name);

  constructor(private blockService: CkbBlockService) {}

  public getBatchFunction() {
    return (hashs: string[]) => {
      this.logger.debug(`Loading transactions for blocks: ${hashs.join(', ')}`);
      return Promise.all(hashs.map((key) => this.blockService.getBlockTransactions(key)));
    };
  }
}
