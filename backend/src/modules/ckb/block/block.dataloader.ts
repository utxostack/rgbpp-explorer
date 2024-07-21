import { Injectable, Logger } from '@nestjs/common';
import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import { DataLoaderResponse } from 'src/common/type/dataloader';
import * as CkbRpc from 'src/core/ckb-rpc/ckb-rpc.interface';
import { CkbBlockService } from './block.service';

@Injectable()
export class CkbBlockLoader implements NestDataLoader<string, CkbRpc.Block> {
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
export type CkbBlockLoaderResponse = DataLoaderResponse<CkbBlockLoader>;

@Injectable()
export class CkbBlockEconomicStateLoader
  implements NestDataLoader<string, CkbRpc.BlockEconomicState>
{
  private logger = new Logger(CkbBlockEconomicStateLoader.name);

  constructor(private blockService: CkbBlockService) {}

  public getBatchFunction() {
    return (hashs: string[]) => {
      this.logger.debug(`Loading economic state for blocks: ${hashs.join(', ')}`);
      return Promise.all(hashs.map((key) => this.blockService.getBlockEconomicState(key)));
    };
  }
}
export type CkbBlockEconomicStateLoaderResponse = DataLoaderResponse<CkbBlockEconomicStateLoader>;
