import { Injectable, Logger } from '@nestjs/common';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import { RgbppTransaction } from './transaction.model';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/env';
import { CkbRpcWebsocketService } from 'src/core/ckb-rpc/ckb-rpc-websocket.service';
import { buildRgbppLockArgs, genRgbppLockScript } from '@rgbpp-sdk/ckb/lib/utils/rgbpp';
import * as BitcoinApiInterface from 'src/core/bitcoin-api/bitcoin-api.schema';
import * as CkbRpcInterface from 'src/core/ckb-rpc/ckb-rpc.interface';
import { RgbppService } from '../rgbpp.service';
import { BI, HashType } from '@ckb-lumos/lumos';
import { Cacheable } from 'src/decorators/cacheable.decorator';
import { ONE_MONTH_MS } from 'src/common/date';
import { LeapDirection } from '@prisma/client';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { CKB_CHAIN_ID, CKB_MIN_SAFE_CONFIRMATIONS } from 'src/constants';

@Injectable()
export class RgbppTransactionService {
  private logger = new Logger(RgbppTransactionService.name);

  constructor(
    private ckbExplorerService: CkbExplorerService,
    private ckbRpcService: CkbRpcWebsocketService,
    private prismaService: PrismaService,
    private rgbppService: RgbppService,
    private bitcoinApiService: BitcoinApiService,
    private configService: ConfigService<Env>,
  ) { }

  private async isSafeConfirmations(blockNumber: string): Promise<boolean> {
    try {
      const tipBlockNumber = await this.ckbRpcService.getTipBlockNumber();
      return BI.from(blockNumber).lt(BI.from(tipBlockNumber).sub(CKB_MIN_SAFE_CONFIRMATIONS));
    } catch {
      return false;
    }
  }

  public async getLatestTransactions(limit: number) {
    const transactions = await this.prismaService.transaction.findMany({
      where: {
        chainId: CKB_CHAIN_ID,
      },
      orderBy: {
        blockNumber: 'desc',
      },
      include: {
        block: true,
      },
      take: limit,
    });
    return transactions.map(RgbppTransaction.from);
  }

  public async getLatestL1Transactions(limit: number) {
    const response = await this.ckbExplorerService.getRgbppTransactions({
      page: 1,
      pageSize: limit,
    });
    return response.data.ckb_transactions.map((tx) => RgbppTransaction.fromRgbppTransaction(tx));
  }

  public async getLatestL2Transactions(limit: number) {
    const transactions = await this.prismaService.transaction.findMany({
      where: {
        chainId: CKB_CHAIN_ID,
        isRgbpp: false,
      },
      orderBy: {
        blockNumber: 'desc',
      },
      include: {
        block: true,
      },
      take: limit,
    });
    return transactions.map(RgbppTransaction.from);
  }

  public async getTransactionByCkbTxHash(txHash: string): Promise<RgbppTransaction | null> {
    const response = await this.ckbExplorerService.getTransaction(txHash);
    if (!response.data.attributes.is_rgb_transaction) {
      return null;
    }
    return RgbppTransaction.fromCkbTransaction(response.data.attributes);
  }

  public async getTransactionByBtcTxid(txid: string): Promise<RgbppTransaction | null> {
    const btcTx = await this.bitcoinApiService.getTx({ txid });
    const tx = (await this.queryRgbppLockTx(btcTx)) ?? (await this.queryRgbppBtcTimeLockTx(btcTx));
    if (tx) {
      return tx;
    }
    return null;
  }

  public async getTransaction(txidOrTxHash: string): Promise<RgbppTransaction | null> {
    let tx: RgbppTransaction | null = null;
    try {
      tx = await this.getTransactionByCkbTxHash(txidOrTxHash);
    } catch (err) {
      this.logger.error(err);
    }
    try {
      tx = await this.getTransactionByBtcTxid(txidOrTxHash);
    } catch (err) {
      this.logger.error(err);
    }
    return tx;
  }

  @Cacheable({
    namespace: 'RgbppTransactionService',
    key: (tx: CkbRpcInterface.Transaction) => `getLeapDirectionByCkbTx:${tx.hash}`,
    ttl: ONE_MONTH_MS,
  })
  public async getLeapDirectionByCkbTx(ckbTx: CkbRpcInterface.Transaction) {
    const inputCells = await Promise.all(
      ckbTx.inputs.map(async (input) => {
        const inputTx = await this.ckbRpcService.getTransaction(input.previous_output.tx_hash);
        const index = BI.from(input.previous_output.index).toNumber();
        return inputTx?.transaction.outputs?.[index] ?? null;
      }),
    );
    const hasRgbppLockInput = inputCells.some(
      (cell) =>
        cell?.lock &&
        this.rgbppService.isRgbppLockScript({
          codeHash: cell.lock.code_hash,
          hashType: cell.lock.hash_type as HashType,
          args: cell.lock.args,
        }),
    );
    const hasRgbppLockOuput = ckbTx.outputs.some(
      (output) =>
        output?.lock &&
        this.rgbppService.isRgbppLockScript({
          codeHash: output.lock.code_hash,
          hashType: output.lock.hash_type as HashType,
          args: output.lock.args,
        }),
    );
    const hasBtcTimeLockOutput = ckbTx.outputs.some(
      (output) =>
        output.lock &&
        this.rgbppService.isBtcTimeLockScript({
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

  @Cacheable({
    namespace: 'RgbppTransactionService',
    key: (btcTx: BitcoinApiInterface.Transaction) => `queryRgbppLockTx:${btcTx.txid}`,
    ttl: ONE_MONTH_MS,
    shouldCache: (tx: RgbppTransaction, that: RgbppTransactionService) => {
      if (!tx) {
        return false;
      }
      return that.isSafeConfirmations(BI.from(tx.blockNumber).toHexString());
    },
  })
  public async queryRgbppLockTx(btcTx: BitcoinApiInterface.Transaction) {
    const ckbTxs = await Promise.all(
      btcTx.vout.map(async (_, index) => {
        const args = buildRgbppLockArgs(index, btcTx.txid);
        const lock = genRgbppLockScript(args, this.configService.get('NETWORK') === 'mainnet');
        return this.ckbRpcService.getTransactions(
          {
            script: {
              code_hash: lock.codeHash,
              hash_type: lock.hashType,
              args: lock.args,
            },
            script_type: 'lock',
          },
          'asc',
          '0x64',
        );
      }),
    );
    for (const ckbTx of ckbTxs) {
      if (ckbTx.objects.length === 0) {
        continue;
      }

      for (const tx of ckbTx.objects) {
        const response = await this.ckbExplorerService.getTransaction(tx.tx_hash);
        if (response.data.attributes.is_rgb_transaction) {
          const rgbppTx = RgbppTransaction.fromCkbTransaction(response.data.attributes);
          if (rgbppTx.btcTxid === btcTx.txid) {
            return rgbppTx;
          }
        }
      }
    }
    return null;
  }

  @Cacheable({
    namespace: 'RgbppTransactionService',
    key: (btcTx: BitcoinApiInterface.Transaction) => `queryRgbppBtcTimeLockTx:${btcTx.txid}`,
    ttl: ONE_MONTH_MS,
    shouldCache: (tx: RgbppTransaction, that: RgbppTransactionService) => {
      if (!tx) {
        return false;
      }
      return that.isSafeConfirmations(BI.from(tx.blockNumber).toHexString());
    },
  })
  public async queryRgbppBtcTimeLockTx(btcTx: BitcoinApiInterface.Transaction) {
    const ckbTxs = (
      await Promise.all(
        btcTx.vin.map(async ({ txid, vout }) => {
          const args = buildRgbppLockArgs(vout, txid);
          const lock = genRgbppLockScript(args, this.configService.get('NETWORK') === 'mainnet');
          return this.ckbRpcService.getTransactions(
            {
              script: {
                code_hash: lock.codeHash,
                hash_type: lock.hashType,
                args: lock.args,
              },
              script_type: 'lock',
            },
            'asc',
            '0x64',
          );
        }),
      )
    )
      .map(({ objects }) => objects)
      .flat();

    for (const ckbTx of ckbTxs) {
      const response = await this.ckbExplorerService.getTransaction(ckbTx.tx_hash);
      if (response.data.attributes.is_btc_time_lock) {
        return RgbppTransaction.fromCkbTransaction(response.data.attributes);
      }
    }
    return null;
  }
}
