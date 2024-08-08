import { Injectable, Logger } from '@nestjs/common';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import { RgbppTransaction, RgbppLatestTransactionList, LeapDirection } from './transaction.model';
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
import { CkbScriptService } from 'src/modules/ckb/script/script.service';

@Injectable()
export class RgbppTransactionService {
  private logger = new Logger(RgbppTransactionService.name);

  constructor(
    private ckbExplorerService: CkbExplorerService,
    private ckbRpcService: CkbRpcWebsocketService,
    private ckbScriptService: CkbScriptService,
    private rgbppService: RgbppService,
    private bitcoinApiService: BitcoinApiService,
    private configService: ConfigService<Env>,
  ) { }

  public async getLatestTransactions(
    page: number,
    pageSize: number,
  ): Promise<RgbppLatestTransactionList> {
    const response = await this.ckbExplorerService.getRgbppTransactions({
      page,
      pageSize,
    });
    return {
      txs: response.data.ckb_transactions.map((tx) => RgbppTransaction.from(tx)),
      total: response.meta.total,
      pageSize: response.meta.page_size,
    };
  }

  public async getLatestL2Transactions(limit: number) {
    const rgbppL2Txs: RgbppTransaction[] = [];
    const tipBlockNumber = await this.ckbRpcService.getTipBlockNumber();
    let blockNumber = BI.from(tipBlockNumber);
    while (rgbppL2Txs.length < limit) {
      const txss = await Promise.all(
        Array({ length: limit }).map(async (_, index) => {
          const block = await this.ckbRpcService.getBlockByNumber(
            blockNumber.sub(index).toHexString(),
          );

          const ckbTxs = block.transactions.filter((tx) => {
            return tx.outputs.some((output) => {
              if (!output.type) {
                return false;
              }
              return this.ckbScriptService.matchScript({
                codeHash: output.type.code_hash,
                hashType: output.type.hash_type as HashType,
                args: output.type.args,
              });
            });
          });

          const txs = await Promise.all(
            ckbTxs.map((tx) => this.ckbExplorerService.getTransaction(tx.hash)),
          );
          return txs;
        }),
      );
      rgbppL2Txs.push(
        ...txss.flat().map((tx) => RgbppTransaction.fromCkbTransaction(tx.data.attributes)),
      );
      blockNumber = blockNumber.sub(limit);
    }

    return {
      txs: rgbppL2Txs.slice(0, limit),
      total: 0,
      pageSize: limit,
    };
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
    key: (tx: CkbRpcInterface.TransactionWithStatusResponse) =>
      `getLeapDirectionByCkbTx:${tx.transaction.hash}`,
    ttl: ONE_MONTH_MS,
  })
  public async getLeapDirectionByCkbTx(ckbTx: CkbRpcInterface.TransactionWithStatusResponse) {
    const inputCells = await Promise.all(
      ckbTx.transaction.inputs.map(async (input) => {
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
    const hasRgbppLockOuput = ckbTx.transaction.outputs.some(
      (output) =>
        output?.lock &&
        this.rgbppService.isRgbppLockScript({
          codeHash: output.lock.code_hash,
          hashType: output.lock.hash_type as HashType,
          args: output.lock.args,
        }),
    );
    const hasBtcTimeLockOutput = ckbTx.transaction.outputs.some(
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
