import { Chain } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import * as BlockchainInterface from '../blockchain/blockchain.interface';
import { BlockchainServiceFactory } from '../blockchain/blockchain.factory';
import { BI } from '@ckb-lumos/bi';
import pLimit from 'p-limit';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/env';

@Injectable()
export class IndexerUtil {
  private limit: pLimit.Limit;

  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService<Env>,
    private blockchainServiceFactory: BlockchainServiceFactory,
  ) {
    this.limit = pLimit(this.configService.get('INDEXER_BATCH_SIZE')!);
  }

  public async getIndexStartBlockNumber(chain: Chain) {
    const latestIndexedBlock = await this.prismaService.block.findFirst({
      where: { chainId: chain.id },
      orderBy: { number: 'desc' },
    });

    const startBlockNumber = latestIndexedBlock ? latestIndexedBlock.number + 1 : chain.startBlock;
    return startBlockNumber;
  }

  public async calculateTransactionFee(
    chain: Chain,
    tx: BlockchainInterface.Transaction,
  ): Promise<number> {
    let inputCapacity = BI.from(0);
    let outputCapacity = BI.from(0);

    const blockchainService = await this.blockchainServiceFactory.getService(chain.id);

    const inputTxHashes = Array.from(
      new Set(tx.inputs.map((input) => input.previous_output.tx_hash)),
    );
    const inputTxs = await Promise.all(
      inputTxHashes.map((txHash) => this.limit(() => blockchainService.getTransaction(txHash))),
    );
    const inputTxsMap = new Map(inputTxs.map((tx) => [tx.transaction.hash, tx]));

    for (const input of tx.inputs) {
      const previousTx = inputTxsMap.get(input.previous_output.tx_hash);
      const ouputIndex = BI.from(input.previous_output.index).toNumber();
      const output = previousTx!.transaction.outputs[ouputIndex];
      inputCapacity = inputCapacity.add(BI.from(output.capacity));
    }
    for (const output of tx.outputs) {
      outputCapacity = outputCapacity.add(BI.from(output.capacity));
    }

    return inputCapacity.sub(outputCapacity).toNumber();
  }
}
