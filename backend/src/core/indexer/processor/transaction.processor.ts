import { Chain, LeapDirection, Output, PrismaClient } from '@prisma/client';
import * as BlockchainInterface from '../../blockchain/blockchain.interface';
import { BaseProcessor } from './base.processor';
import { BI } from '@ckb-lumos/bi';
import { Injectable, Logger } from '@nestjs/common';
import { CELLBASE_TX_HASH, RgbppCoreService } from 'src/core/rgbpp/rgbpp.service';
import { HashType, Script } from '@ckb-lumos/lumos';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { ITXClientDenyList } from '@prisma/client/runtime/library';

export type PrismaTransaction = Omit<PrismaClient, ITXClientDenyList>;

export interface IndexerTransactionData {
  chain: Chain;
  block: BlockchainInterface.Block;
  transaction: BlockchainInterface.Transaction;
  index: string;
}

@Injectable()
export class TransactionProcessor extends BaseProcessor<IndexerTransactionData> {
  private logger = new Logger(TransactionProcessor.name);

  constructor(
    private prismaService: PrismaService,
    private rgbppCoreService: RgbppCoreService,
  ) {
    super();
  }

  public async process(data: IndexerTransactionData): Promise<void> {
    const { chain, block, transaction, index } = data;
    this.logger.debug(`Processing transaction ${transaction.hash} for chain ${chain.name}`);

    const inputs = await this.getTransactionInputs(chain, transaction);

    const blockNumber = BI.from(block.header.number).toNumber();
    const timestamp = new Date(BI.from(block.header.timestamp).toNumber());
    const isCellbase = this.isCellbase(transaction);
    const isRgbpp = this.isRgbppTransaction(transaction);
    const leapDirection = isCellbase
      ? null
      : await this.getLeapDirection(chain, inputs, transaction.outputs);
    const fee = isCellbase ? 0n : await this.calculateTransactionFee(inputs, transaction.outputs);

    // Update consumedByTxHash and consumedByIndex for inputs
    await Promise.all(
      transaction.inputs.map((input) => {
        return this.prismaService.output.update({
          where: {
            chainId_txHash_index: {
              chainId: chain.id,
              txHash: input.previous_output.tx_hash,
              index: input.previous_output.index,
            },
          },
          data: {
            consumedByTxHash: transaction.hash,
            consumedByIndex: index,
          },
        });
      }),
    );

    await this.prismaService.transaction.create({
      data: {
        chainId: chain.id,
        hash: transaction.hash,
        index,
        blockNumber,
        timestamp,
        fee,
        inputCount: transaction.inputs.length,
        outputCount: transaction.outputs.length,
        size: 0, // TODO: implement transaction size calculation
        isCellbase,
        isRgbpp,
        leapDirection: leapDirection,
      },
    });
  }

  private async getTransactionInputs(chain: Chain, transaction: BlockchainInterface.Transaction) {
    const inputs = await this.prismaService.output.findMany({
      where: {
        OR: transaction.inputs
          .filter((input) => input.previous_output.tx_hash !== CELLBASE_TX_HASH)
          .map((input) => ({
            AND: [
              { txHash: input.previous_output.tx_hash },
              { index: input.previous_output.index },
              { chainId: chain.id },
            ],
          })),
      },
    });
    return inputs;
  }

  private isCellbase(transaction: BlockchainInterface.Transaction): boolean {
    return (
      transaction.inputs.length === 1 &&
      transaction.inputs[0].previous_output.tx_hash === CELLBASE_TX_HASH
    );
  }

  private async calculateTransactionFee(
    inputs: Output[],
    outputs: BlockchainInterface.Output[],
  ): Promise<bigint> {
    let inputCapacity = BI.from(0);
    let outputCapacity = BI.from(0);

    for (const input of inputs) {
      inputCapacity = inputCapacity.add(BI.from(input.capacity));
    }
    for (const output of outputs) {
      outputCapacity = outputCapacity.add(BI.from(output.capacity));
    }

    return inputCapacity.sub(outputCapacity).toBigInt();
  }

  private isRgbppTransaction(transaction: BlockchainInterface.Transaction): boolean {
    return transaction.outputs.some((output) => {
      const script: Script = {
        codeHash: output.lock.code_hash,
        hashType: output.lock.hash_type as HashType,
        args: output.lock.args,
      };
      return (
        this.rgbppCoreService.isRgbppLockScript(script) ||
        this.rgbppCoreService.isBtcTimeLockScript(script)
      );
    });
  }

  private async getLeapDirection(
    chain: Chain,
    inputs: Output[],
    outputs: BlockchainInterface.Output[],
  ): Promise<LeapDirection | null> {
    const inputLockScriptHashes = inputs.map((input) => input.lockScriptHash);
    const lockScripts = await this.prismaService.lockScript.findMany({
      where: {
        chainId: chain.id,
        scriptHash: {
          in: inputLockScriptHashes,
        },
      },
    });

    const hasRgbppLockInput = lockScripts.some((script) =>
      this.rgbppCoreService.isRgbppLockScript({
        codeHash: script.codeHash,
        hashType: script.hashType as HashType,
        args: script.args,
      }),
    );
    const hasRgbppLockOuput = outputs.some(
      (output) =>
        output.lock &&
        this.rgbppCoreService.isRgbppLockScript({
          codeHash: output.lock.code_hash,
          hashType: output.lock.hash_type as HashType,
          args: output.lock.args,
        }),
    );
    const hasBtcTimeLockOutput = outputs.some(
      (output) =>
        output.lock &&
        this.rgbppCoreService.isBtcTimeLockScript({
          codeHash: output.lock.code_hash,
          hashType: output.lock.hash_type as HashType,
          args: output.lock.args,
        }),
    );
    if (hasRgbppLockInput && hasBtcTimeLockOutput) {
      return LeapDirection.LeapOut;
    }
    if (hasRgbppLockInput && hasRgbppLockOuput) {
      return LeapDirection.Within;
    }
    if (!hasRgbppLockInput && hasRgbppLockOuput) {
      return LeapDirection.LeapIn;
    }
    return null;
  }
}
