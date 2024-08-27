import { DelayedError, Job } from 'bullmq';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma/prisma.service';
import * as BlockchainInterface from '../blockchain/blockchain.interface';
import { TEN_MINUTES_MS } from 'src/common/date';
import { Chain } from '@prisma/client';
import { Env } from 'src/env';
import { BI } from '@ckb-lumos/bi';
import { BlockProcessor } from './processor/block.processor';
import { TransactionProcessor } from './processor/transaction.processor';
import { CELLBASE_TX_HASH } from '../rgbpp/rgbpp.service';
import { HashType, Script } from '@ckb-lumos/lumos';
import { computeScriptHash } from '@ckb-lumos/lumos/utils';
import { TypeScriptProcessor } from './processor/type.processor';
import { LockScriptProcessor } from './processor/lock.processor';
import { OutputProcessor } from './processor/output.processor';

export const INDEXER_PROCESSOR_QUEUE = 'indexer-processor-queue';

export interface IndexerJobData {
  chain: Chain;
  block: BlockchainInterface.Block;
}

@Processor(INDEXER_PROCESSOR_QUEUE)
export class IndexerProcessor extends WorkerHost implements OnModuleInit {
  private logger = new Logger(IndexerProcessor.name);
  private batchSize: number;
  private workerNumber: number;

  constructor(
    configService: ConfigService<Env>,
    private prismaService: PrismaService,
    private blockProcessor: BlockProcessor,
    private transactionProcessor: TransactionProcessor,
    private outputProcessor: OutputProcessor,
    private typeScriptProcessor: TypeScriptProcessor,
    private lockScriptProcessor: LockScriptProcessor,
  ) {
    super();
    this.batchSize = configService.get('INDEXER_BATCH_SIZE')!;
    this.workerNumber = configService.get('INDEXER_WORKER_NUM')!;
  }

  public async onModuleInit() {
    this.worker.concurrency = this.batchSize * this.workerNumber;
    this.worker.opts.stalledInterval = TEN_MINUTES_MS;
    this.worker.opts.maxStalledCount = 5;
    this.worker.opts.useWorkerThreads = true;
  }

  public async process(job: Job<IndexerJobData>): Promise<void> {
    const { chain, block } = job.data;
    // if (!(await this.isPreviousProcessFinished(chain, block))) {
    //   this.logger.debug(
    //     `Previous process not finished for block ${block.header.hash} for chain ${chain.name}`,
    //   );
    //   job.moveToDelayed(Date.now() + 5000);
    //   throw new DelayedError();
    // }

    await this.blockProcessor.process({ chain, block });
    await this.processTypeScripts({ chain, block });
    await this.processLockScripts({ chain, block });

    await Promise.all(
      block.transactions.map(async (transaction, index) => {
        await this.transactionProcessor.process({
          chain,
          block,
          transaction,
          index: BI.from(index).toHexString(),
        });

        await Promise.all(
          transaction.outputs.map((output, index) => {
            return this.outputProcessor.process({
              chain,
              txHash: transaction.hash,
              index: BI.from(index).toHexString(),
              output,
            });
          }),
        );
      }),
    );
  }

  private async processTypeScripts({ chain, block }: IndexerJobData) {
    const outputs = block.transactions.flatMap((tx) => tx.outputs);
    const typeScriptHashes = new Set();
    const typeScripts: {
      scriptHash: string;
      script: Script;
    }[] = [];
    outputs
      .map((output) => output.type)
      .filter((type) => !!type)
      .forEach((type) => {
        const script: Script = {
          codeHash: type!.code_hash,
          hashType: type!.hash_type as HashType,
          args: type!.args,
        };
        const scriptHash = computeScriptHash(script);
        if (!typeScriptHashes.has(scriptHash)) {
          typeScriptHashes.add(scriptHash);
          typeScripts.push({
            scriptHash,
            script,
          });
        }
      });

    await Promise.all(
      typeScripts.map(async ({ script, scriptHash }) => {
        await this.typeScriptProcessor.process({
          chain,
          script,
          scriptHash,
        });
      }),
    );
  }

  private async processLockScripts({ chain, block }: IndexerJobData) {
    const outputs = block.transactions.flatMap((tx) => tx.outputs);
    const lockScriptHashes = new Set();
    const lockScripts: {
      scriptHash: string;
      script: Script;
    }[] = [];
    outputs
      .map((output) => output.lock)
      .forEach((lock) => {
        const script: Script = {
          codeHash: lock.code_hash,
          hashType: lock.hash_type as HashType,
          args: lock.args,
        };
        const scriptHash = computeScriptHash(script);
        if (!lockScriptHashes.has(scriptHash)) {
          lockScriptHashes.add(scriptHash);
          lockScripts.push({
            scriptHash,
            script,
          });
        }
      });

    await Promise.all(
      lockScripts.map(async ({ script, scriptHash }) => {
        await this.lockScriptProcessor.process({
          chain,
          script,
          scriptHash,
        });
      }),
    );
  }

  private async isPreviousProcessFinished(chain: Chain, block: BlockchainInterface.Block) {
    if (BI.from(block.header.number).isZero()) {
      return true;
    }

    const dependenciesTxHashes = new Set<string>();
    for (const tx of block.transactions) {
      for (const input of tx.inputs) {
        const txHash = input.previous_output.tx_hash;
        if (txHash === CELLBASE_TX_HASH) {
          continue;
        }
        dependenciesTxHashes.add(input.previous_output.tx_hash);
      }
    }
    if (dependenciesTxHashes.size === 0) {
      return true;
    }

    const txs = await this.prismaService.transaction.findMany({
      where: {
        chainId: chain.id,
        hash: {
          in: Array.from(dependenciesTxHashes),
        },
      },
      include: {
        outputs: true,
      },
    });
    if (txs.length < dependenciesTxHashes.size) {
      return false;
    }

    return txs.every((tx) => tx.outputs.length === tx.outputCount);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<IndexerJobData>, error: Error) {
    const { chain, block } = job.data;
    const blockNumber = BI.from(block.header.number).toNumber();
    this.logger.error(
      `Block ${block.header.hash}(${blockNumber}) for chain ${chain.name}: ${error.message} processing failed`,
    );
    this.logger.error(error.stack);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<IndexerJobData>) {
    const { chain, block } = job.data;
    const blockNumber = BI.from(block.header.number).toNumber();
    this.logger.log(
      `Block ${block.header.hash}(${blockNumber}) for chain ${chain.name} processed successfully`,
    );
  }
}
