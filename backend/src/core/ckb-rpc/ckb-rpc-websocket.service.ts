import { Injectable, Logger } from '@nestjs/common';
import { BlockchainServiceFactory } from '../blockchain/blockchain.factory';
import { CKB_CHAIN_ID } from 'src/constants';
import { BlockchainService } from '../blockchain/blockchain.service';
import {
  Block,
  BlockEconomicState,
  GetCellsResult,
  GetTransactionsResult,
  SearchKey,
  TransactionWithStatusResponse,
} from './ckb-rpc.interface';

@Injectable()
export class CkbRpcWebsocketService {
  private service: BlockchainService;

  constructor(private blockchainServiceFactory: BlockchainServiceFactory) {
    this.service = this.blockchainServiceFactory.getService(CKB_CHAIN_ID);
  }

  public async getTransaction(txHash: string): Promise<TransactionWithStatusResponse> {
    return this.service.getTransaction(txHash);
  }

  public async getBlock(blockHash: string): Promise<Block> {
    return this.service.getBlock(blockHash);
  }

  public async getBlockByNumber(blockNumber: string): Promise<Block> {
    return this.service.getBlockByNumber(blockNumber);
  }

  public async getBlockEconomicState(blockHash: string): Promise<BlockEconomicState> {
    return this.service.getBlockEconomicState(blockHash);
  }

  public async getTipBlockNumber(): Promise<number> {
    return this.service.getTipBlockNumber();
  }

  public async getTransactions(
    searchKey: SearchKey,
    order: 'asc' | 'desc',
    limit: string,
    after?: string,
  ): Promise<GetTransactionsResult> {
    return this.service.getTransactions(searchKey, order, limit, after);
  }

  public async getCells(
    searchKey: SearchKey,
    order: 'asc' | 'desc',
    limit: string,
    after?: string,
  ): Promise<GetCellsResult> {
    return this.service.getCells(searchKey, order, limit, after);
  }
}
