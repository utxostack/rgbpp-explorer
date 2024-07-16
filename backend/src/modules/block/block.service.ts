import { Injectable } from '@nestjs/common';
import { CKBExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import { Block, BaseBlock } from './block.model';
import { Transaction, BaseTransaction } from '../transaction/transaction.model';

@Injectable()
export class BlockService {
  constructor(private ckbExplorerService: CKBExplorerService) { }

  public async getLatestBlockNumbers(): Promise<string[]> {
    const blockList = await this.ckbExplorerService.getBlockList();
    return blockList.data.map((block) => block.attributes.number);
  }

  public async getBlock(heightOrHash: string): Promise<BaseBlock> {
    const block = await this.ckbExplorerService.getBlock(heightOrHash);
    return Block.fromCKBExplorer(block.data.attributes);
  }

  public async getBlockTransactions(blockHash: string): Promise<BaseTransaction[]> {
    const blockTransactions = await this.ckbExplorerService.getBlockTransactions(blockHash);
    return blockTransactions.data.map((transaction) =>
      Transaction.fromCKBExplorer(transaction.attributes),
    );
  }
}
