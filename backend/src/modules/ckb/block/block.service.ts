import { Injectable } from '@nestjs/common';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import * as CkbExplorer from 'src/core/ckb-explorer/ckb-explorer.interface';

@Injectable()
export class CkbBlockService {
  constructor(private ckbExplorerService: CkbExplorerService) {}

  public async getLatestBlockNumbers(): Promise<string[]> {
    const blockList = await this.ckbExplorerService.getBlockList();
    return blockList.data.map((block) => block.attributes.number);
  }

  public async getBlock(heightOrHash: string): Promise<CkbExplorer.Block> {
    const block = await this.ckbExplorerService.getBlock(heightOrHash);
    return block.data.attributes;
  }

  public async getBlockTransactions(blockHash: string): Promise<CkbExplorer.Transaction[]> {
    const blockTransactions = await this.ckbExplorerService.getBlockTransactions(blockHash);
    return blockTransactions.data.map((transaction) => transaction.attributes);
  }
}
