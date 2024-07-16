import { Injectable, Logger } from '@nestjs/common';
import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import { BaseTransaction } from '../transaction/transaction.model';
import { BlockService } from './block.service';
import { BaseBlock } from './block.model';

@Injectable()
export class BlockLoader implements NestDataLoader<string, BaseBlock> {
  private logger = new Logger(BlockLoader.name);

  constructor(private readonly blockService: BlockService) { }

  public getBatchFunction() {
    return (heightOrHashList: string[]) => {
      this.logger.debug(`Loading blocks: ${heightOrHashList.join(', ')}`);
      return Promise.all(
        heightOrHashList.map((heightOrHash) => this.blockService.getBlock(heightOrHash)),
      );
    };
  }
}

@Injectable()
export class BlockTransactionsLoader
  implements NestDataLoader<string, BaseTransaction[]> {
  private logger = new Logger(BlockTransactionsLoader.name);

  constructor(private readonly blockService: BlockService) { }

  public getBatchFunction() {
    return (hashs: string[]) => {
      this.logger.debug(`Loading transactions for blocks: ${hashs.join(', ')}`);
      return Promise.all(hashs.map((key) => this.blockService.getBlockTransactions(key)));
    };
  }
}
