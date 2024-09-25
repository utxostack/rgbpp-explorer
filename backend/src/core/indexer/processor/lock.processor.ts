import { config, helpers, Script } from '@ckb-lumos/lumos';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { computeScriptHash } from '@ckb-lumos/lumos/utils';
import { CoreService } from 'src/core/core.service';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import { Env } from 'src/env';
import { ConfigService } from '@nestjs/config';
import { NetworkType } from 'src/constants';
import * as Sentry from '@sentry/node';

export const INDEXER_LOCK_QUEUE = 'indexer-lock-queue';

export interface IndexerLockJobData {
  chainId: number;
  script: Script;
}

class IndexerLockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IndexerLockError';
  }
}

@Processor(INDEXER_LOCK_QUEUE, {
  stalledInterval: 60_000,
  useWorkerThreads: true,
})
export class IndexerLockProcessor extends WorkerHost {
  private logger = new Logger(IndexerLockProcessor.name);

  constructor(
    private prismaService: PrismaService,
    private bitcoinApiService: BitcoinApiService,
    private coreService: CoreService,
    private configService: ConfigService<Env>,
  ) {
    super();
  }

  @OnWorkerEvent('active')
  public onActive(job: Job<IndexerLockJobData>) {
    const { chainId, script } = job.data;
    this.logger.debug(
      `Indexing lock script for chain ${chainId} with script hash ${computeScriptHash(script)}`,
    );
  }

  @OnWorkerEvent('completed')
  public onCompleted(job: Job<IndexerLockJobData>) {
    const { chainId, script } = job.data;
    this.logger.log(
      `Indexing lock script for chain ${chainId} with script hash ${computeScriptHash(script)} completed`,
    );
  }

  @OnWorkerEvent('failed')
  public onFailed(job: Job<IndexerLockJobData>, error: Error) {
    const { chainId, script } = job.data;
    this.logger.error(
      `Indexing lock script for chain ${chainId} with script hash ${computeScriptHash(script)} failed`,
    );
    this.logger.error(error.stack);
    Sentry.captureException(error);
  }

  public async process(job: Job<IndexerLockJobData>): Promise<any> {
    const { chainId, script } = job.data;
    const scriptHash = computeScriptHash(script);
    const isRgbppLock = this.coreService.isRgbppLockScript(script);
    const isBtcTimeLock = this.coreService.isBtcTimeLockScript(script);

    let address: string | null = null;
    if (isRgbppLock) {
      try {
        const { btcTxid, outIndex } = this.coreService.parseRgbppLockArgs(script.args);
        const btcTx = await this.bitcoinApiService.getTx({ txid: btcTxid });
        const output = btcTx.vout[outIndex];

        if (!output) {
          throw new IndexerLockError(`No output found for index ${outIndex} of tx ${btcTxid}`);
        }

        if (!output.scriptpubkey_address) {
          throw new IndexerLockError(`No address found for output ${outIndex} of tx ${btcTxid}`);
        }
        address = output.scriptpubkey_address;
      } catch (err) {
        this.logger.error(err.message);
        if (err instanceof IndexerLockError) {
          Sentry.captureException(err);
        }
        const error = new IndexerLockError(err.message);
        Sentry.captureException(error);
        return;
      }
    } else {
      const ckbAddress = helpers.encodeToAddress(script, {
        config:
          this.configService.get('NETWORK') === NetworkType.mainnet
            ? config.predefined.LINA
            : config.predefined.AGGRON4,
      });
      address = ckbAddress;
    }

    await this.prismaService.lockScript.upsert({
      where: {
        chainId_scriptHash: {
          chainId,
          scriptHash,
        },
      },
      update: {},
      create: {
        chainId,
        scriptHash,
        isRgbppLock,
        isBtcTimeLock,
        ownerAddress: address,
        ...script,
      },
    });
  }
}
