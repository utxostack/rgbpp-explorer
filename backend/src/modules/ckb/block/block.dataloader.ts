import DataLoader from 'dataloader';
import { Injectable, Logger } from '@nestjs/common';
import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import { DataLoaderResponse } from 'src/common/type/dataloader';
import * as CkbRpc from 'src/core/ckb-rpc/ckb-rpc.interface';
import * as CkbExplorer from 'src/core/ckb-explorer/ckb-explorer.interface';
import { CkbBlockService } from './block.service';

@Injectable()
export class CkbRpcBlockLoader implements NestDataLoader<string, CkbRpc.Block> {
  private logger = new Logger(CkbRpcBlockLoader.name);

  constructor(private blockService: CkbBlockService) {}

  public getBatchFunction() {
    return (heightOrHashList: string[]) => {
      this.logger.debug(`Loading blocks from CkbRpc: ${heightOrHashList.join(', ')}`);
      return Promise.all(
        heightOrHashList.map((heightOrHash) => this.blockService.getBlockFromRpc(heightOrHash)),
      );
    };
  }
}
export type CkbRpcBlockLoaderType = DataLoader<string, CkbRpc.Block>;
export type CkbRpcBlockLoaderResponse = DataLoaderResponse<CkbRpcBlockLoader>;

@Injectable()
export class CkbExplorerBlockLoader implements NestDataLoader<string, CkbExplorer.Block> {
  private logger = new Logger(CkbRpcBlockLoader.name);

  constructor(private blockService: CkbBlockService) {}

  public getBatchFunction() {
    return (heightOrHashList: string[]) => {
      this.logger.debug(`Loading blocks from CkbExplorer: ${heightOrHashList.join(', ')}`);
      return Promise.all(
        heightOrHashList.map((heightOrHash) =>
          this.blockService.getBlockFromExplorer(heightOrHash),
        ),
      );
    };
  }
}
export type CkbExplorerBlockLoaderType = DataLoader<string, CkbExplorer.Block>;
export type CkbExplorerBlockLoaderResponse = DataLoaderResponse<CkbExplorerBlockLoader>;

@Injectable()
export class CkbBlockEconomicStateLoader
  implements NestDataLoader<string, CkbRpc.BlockEconomicState>
{
  private logger = new Logger(CkbBlockEconomicStateLoader.name);

  constructor(private blockService: CkbBlockService) {}

  public getBatchFunction() {
    return (hashes: string[]) => {
      this.logger.debug(`Loading economic state for blocks: ${hashes.join(', ')}`);
      return Promise.all(hashes.map((key) => this.blockService.getBlockEconomicState(key)));
    };
  }
}
export type CkbBlockEconomicStateLoaderType = DataLoader<string, CkbRpc.BlockEconomicState>;
export type CkbBlockEconomicStateLoaderResponse = DataLoaderResponse<CkbBlockEconomicStateLoader>;
