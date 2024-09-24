import { Injectable } from '@nestjs/common';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import { CkbRpcWebsocketService } from 'src/core/ckb-rpc/ckb-rpc-websocket.service';
import * as CkbExplorer from 'src/core/ckb-explorer/ckb-explorer.interface';
import * as CkbRpc from 'src/core/ckb-rpc/ckb-rpc.interface';

@Injectable()
export class CkbBlockService {
  constructor(
    private ckbExplorerService: CkbExplorerService,
    private ckbRpcService: CkbRpcWebsocketService,
  ) {}

  public async getBlockFromRpc(heightOrHash: string): Promise<CkbRpc.Block> {
    if (heightOrHash.startsWith('0x')) {
      return await this.ckbRpcService.getBlock(heightOrHash);
    }
    return await this.ckbRpcService.getBlockByNumber(heightOrHash);
  }

  public async getBlockFromExplorer(heightOrHash: string): Promise<CkbExplorer.Block> {
    const res = await this.ckbExplorerService.getBlock(heightOrHash);
    return res.data.attributes;
  }

  public async getBlockEconomicState(blockHash: string): Promise<CkbRpc.BlockEconomicState> {
    return await this.ckbRpcService.getBlockEconomicState(blockHash);
  }
}
