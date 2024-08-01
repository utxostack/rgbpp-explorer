import DataLoader from 'dataloader';
import { Injectable, Logger } from '@nestjs/common';
import { NestDataLoader } from '@applifting-io/nestjs-dataloader';
import { DataLoaderResponse } from 'src/common/type/dataloader';
import * as CkbRpc from 'src/core/ckb-rpc/ckb-rpc.interface';
import * as CkbExplorer from 'src/core/ckb-explorer/ckb-explorer.interface';
import { CkbBlockService } from './block.service';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';

@Injectable()
export class CkbRpcBlockLoader implements NestDataLoader<string, CkbRpc.Block |  null> {
  private logger = new Logger(CkbRpcBlockLoader.name);

  constructor(
    private blockService: CkbBlockService,
    @InjectSentry() private sentryService: SentryService,
  ) {}

  public getBatchFunction() {
    return async (heightOrHashList: string[]) => {
      this.logger.debug(`Loading blocks from CkbRpc: ${heightOrHashList.join(', ')}`);
      const results = await Promise.allSettled(
        heightOrHashList.map((heightOrHash) => this.blockService.getBlockFromRpc(heightOrHash)),
      );
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        this.logger.error(`Requesting: ${heightOrHashList[index]}, occurred error: ${result.reason}`);
        this.sentryService.instance().captureException(result.reason);
        return null;
      });
    };
  }
}
export type CkbRpcBlockLoaderType = DataLoader<string, CkbRpc.Block | null>;
export type CkbRpcBlockLoaderResponse = DataLoaderResponse<CkbRpcBlockLoader>;

@Injectable()
export class CkbExplorerBlockLoader implements NestDataLoader<string, CkbExplorer.Block | null> {
  private logger = new Logger(CkbRpcBlockLoader.name);

  constructor(
    private blockService: CkbBlockService,
    @InjectSentry() private sentryService: SentryService,
  ) {}

  public getBatchFunction() {
    return async (heightOrHashList: string[]) => {
      this.logger.debug(`Loading blocks from CkbExplorer: ${heightOrHashList.join(', ')}`);
      const results = await Promise.allSettled(
        heightOrHashList.map((heightOrHash) =>
          this.blockService.getBlockFromExplorer(heightOrHash),
        ),
      );
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        this.logger.error(`Requesting: ${heightOrHashList[index]}, occurred error: ${result.reason}`);
        this.sentryService.instance().captureException(result.reason);
        return null;
      });
    };
  }
}
export type CkbExplorerBlockLoaderType = DataLoader<string, CkbExplorer.Block | null>;
export type CkbExplorerBlockLoaderResponse = DataLoaderResponse<CkbExplorerBlockLoader>;

@Injectable()
export class CkbBlockEconomicStateLoader
  implements NestDataLoader<string, CkbRpc.BlockEconomicState | null>
{
  private logger = new Logger(CkbBlockEconomicStateLoader.name);

  constructor(
    private blockService: CkbBlockService,
    @InjectSentry() private sentryService: SentryService,
  ) {}

  public getBatchFunction() {
    return async (hashes: string[]) => {
      this.logger.debug(`Loading economic state for blocks: ${hashes.join(', ')}`);
      const results = await Promise.allSettled(
        hashes.map((key) => this.blockService.getBlockEconomicState(key)),
      );
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        this.logger.error(`Requesting: ${hashes[index]}, occurred error: ${result.reason}`);
        this.sentryService.instance().captureException(result.reason);
        return null;
      });
    };
  }
}
export type CkbBlockEconomicStateLoaderType = DataLoader<string, CkbRpc.BlockEconomicState | null>;
export type CkbBlockEconomicStateLoaderResponse = DataLoaderResponse<CkbBlockEconomicStateLoader>;
