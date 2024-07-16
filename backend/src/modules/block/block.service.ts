import { Injectable } from '@nestjs/common';
import { CKBExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import { Block, BlockWithoutResolveFields } from './block.model';
import { Transaction, TransactionWithoutResolveFields } from '../transaction/transaction.model';

@Injectable()
export class BlockService {
  constructor(private ckbExplorerService: CKBExplorerService) { }

  public async getLatestBlocks(): Promise<BlockWithoutResolveFields[]> {
    const blockList = await this.ckbExplorerService.getBlockList();
    const blocks = await Promise.all(
      blockList.data.map(async (block) => {
        return this.ckbExplorerService.getBlock(block.attributes.number);
      }),
    );
    return blocks.map((block) => Block.fromCKBExplorer(block.data.attributes));
  }

  public async getBlock(heightOrHash: string): Promise<BlockWithoutResolveFields> {
    const block = await this.ckbExplorerService.getBlock(heightOrHash);
    return Block.fromCKBExplorer(block.data.attributes);
  }

  public async getBlockTransactions(blockHash: string): Promise<TransactionWithoutResolveFields[]> {
    const blockTransactions = await this.ckbExplorerService.getBlockTransactions(blockHash);
    return blockTransactions.data.map((transaction) =>
      Transaction.fromCKBExplorer(transaction.attributes),
    );
  }
}
