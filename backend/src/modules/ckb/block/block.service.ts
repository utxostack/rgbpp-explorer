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
  ) { }

  public async getLatestBlockNumbers(): Promise<string[]> {
    const blockList = await this.ckbExplorerService.getBlockList();
    return blockList.data.map((block) => block.attributes.number);
  }

  public async getBlock(heightOrHash: string): Promise<CkbRpc.Block> {
    if (heightOrHash.startsWith('0x')) {
      const block = await this.ckbRpcService.getBlock(heightOrHash);
      return block;
    }
    const block = await this.ckbRpcService.getBlockByNumber(heightOrHash);
    return block;
  }

  public async getBlockEconomicState(blockHash: string): Promise<CkbRpc.BlockEconomicState> {
    const blockEconomicState = await this.ckbRpcService.getBlockEconomicState(blockHash);
    return blockEconomicState;
  }

  public async getBlockTransactions(blockHash: string): Promise<CkbExplorer.Transaction[]> {
    const blockTransactions = await this.ckbExplorerService.getBlockTransactions(blockHash);
    return blockTransactions.data.map((transaction) => transaction.attributes);
  }
}
