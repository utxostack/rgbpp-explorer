import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ONE_DAY_MS, TEN_MINUTES_MS } from 'src/common/date';
import { CkbRpcWebsocketService } from 'src/core/ckb-rpc/ckb-rpc-websocket.service';
import * as pLimit from 'p-limit';
import { BI } from '@ckb-lumos/bi';
import { CkbScriptService } from 'src/modules/ckb/script/script.service';
import { CellType } from 'src/modules/ckb/script/script.model';
import { isScriptEqual } from '@rgbpp-sdk/ckb';
import { HashType, Script } from '@ckb-lumos/lumos';
import * as BitcoinApiInterface from 'src/core/bitcoin-api/bitcoin-api.interface';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import { RgbppService } from '../rgbpp.service';
import { RgbppTransactionService } from '../transaction/transaction.service';
import { RgbppBaseTransaction } from '../transaction/transaction.model';

const BTC_24_HOURS_BLOCK_NUMBER = ONE_DAY_MS / TEN_MINUTES_MS;
// TODO: refactor the `Average Block Time` constant
// CKB testnet: ~8s, see https://pudge.explorer.nervos.org/charts/average-block-time
// CKB mainnet: ~10s, see https://explorer.nervos.org/charts/average-block-time
const CKB_24_HOURS_BLOCK_NUMBER = ONE_DAY_MS / 10000;
const RGBPP_ASSETS_CELL_TYPE = [CellType.XUDT, CellType.SUDT, CellType.DOB, CellType.MNFT];
const limit = pLimit(200);

@Injectable()
export class RgbppStatisticService {
  private logger = new Logger(RgbppStatisticService.name);
  private latest24L1TransactionsCacheKey = 'RgbppStatisticService:latest24L1Transactions';
  private latest24L2TransactionsCacheKey = 'RgbppStatisticService:latest24L2Transactions';

  private rgbppAssetsTypeScripts = RGBPP_ASSETS_CELL_TYPE.map((type) => {
    const service = this.ckbScriptService.getServiceByCellType(type);
    const scripts = service.getScripts();
    return scripts;
  }).flat();

  constructor(
    private ckbRpcService: CkbRpcWebsocketService,
    private bitcoinApiService: BitcoinApiService,
    private ckbScriptService: CkbScriptService,
    private rgbppService: RgbppService,
    private rgbppTransactionService: RgbppTransactionService,
    @Inject(CACHE_MANAGER) protected cacheManager: Cache,
  ) {
    this.collectLatest24L1Transactions();
    this.collectLatest24L2Transactions();
  }

  public async getLatest24L1Transactions() {
    const txids = await this.cacheManager.get(this.latest24L1TransactionsCacheKey);
    if (txids) {
      return txids as string[];
    }
    return this.collectLatest24L1Transactions();
  }

  public async getLatest24L2Transactions() {
    const txhashes = await this.cacheManager.get(this.latest24L2TransactionsCacheKey);
    if (txhashes) {
      return txhashes as string[];
    }
    return this.collectLatest24L2Transactions();
  }

  public async collectLatest24L1Transactions() {
    const info = await this.bitcoinApiService.getBlockchainInfo();
    this.logger.log(
      `start collectLatest24L1Transactions: ${info.blocks - BTC_24_HOURS_BLOCK_NUMBER}`,
    );
    const blocks = await Promise.all(
      Array.from({ length: BTC_24_HOURS_BLOCK_NUMBER }).map((_, index) => {
        return limit(() => this.getRgbppL1TxidsByBtcBlockHeight(info.blocks - index));
      }),
    );
    const txids = blocks
      .flat()
      .map(({ txids }) => txids)
      .flat();
    await this.cacheManager.set(this.latest24L1TransactionsCacheKey, txids, ONE_DAY_MS);
    this.logger.log(`finish collectLatest24L1Transactions: ${txids.length}`);
    return txids;
  }

  public async collectLatest24L2Transactions() {
    const tipBlockNumber = await this.ckbRpcService.getTipBlockNumber();
    this.logger.log(
      `start collectLatest24L2Transactions: ${BI.from(tipBlockNumber).sub(CKB_24_HOURS_BLOCK_NUMBER).toNumber()}`,
    );

    const blocks = await Promise.all(
      Array.from({ length: CKB_24_HOURS_BLOCK_NUMBER }).map((_, index) => {
        return limit(() =>
          this.getRgbppL2TxHashsByCkbBlockNumber(BI.from(tipBlockNumber).sub(index).toHexString()),
        );
      }),
    );
    const txhashs = blocks
      .flat()
      .map(({ txhashs }) => txhashs)
      .flat();
    await this.cacheManager.set(this.latest24L2TransactionsCacheKey, txhashs, ONE_DAY_MS);
    this.logger.log(`finish collectLatest24L2Transactions: ${txhashs.length}`);
    return txhashs;
  }

  private async getRgbppL1TxidsByBtcBlockHeight(blockHeight: number) {
    const hash = await this.bitcoinApiService.getBlockHeight({ height: blockHeight });
    const block = await this.bitcoinApiService.getBlock({ hash });
    const blockTxs = await this.bitcoinApiService.getBlockTxs({ hash });

    const txs = await Promise.all(
      blockTxs.map(async (tx: BitcoinApiInterface.Transaction) => {
        const rgbppTransaction =
          (await this.rgbppTransactionService.queryRgbppLockTx(tx)) ??
          (await this.rgbppTransactionService.queryRgbppBtcTimeLockTx(tx));
        return rgbppTransaction;
      }),
    );
    const txids = txs.filter((tx: RgbppBaseTransaction) => tx?.btcTxid).map((tx) => tx!.btcTxid);
    return {
      ...block,
      txids,
    };
  }

  private async getRgbppL2TxHashsByCkbBlockNumber(blockNumber: string) {
    const block = await this.ckbRpcService.getBlockByNumber(blockNumber);
    const rgbppL2Txs = block.transactions.filter((tx) => {
      const isRgbppL2Tx = tx.outputs.some((output) => {
        if (!output.type) {
          return false;
        }

        // Skip txs without RGB++ assets
        const hasRgbppAssets = this.rgbppAssetsTypeScripts.some((script) =>
          isScriptEqual(script, {
            codeHash: output.type!.code_hash,
            hashType: output.type!.hash_type as HashType,
            args: '0x',
          }),
        );
        if (!hasRgbppAssets) {
          return false;
        }

        // Skip txs with RGB++ lock script
        const hasRgbppOuputCell = tx.outputs.some((cell) => {
          const lock: Script = {
            codeHash: cell.lock.code_hash,
            hashType: cell.lock.hash_type as HashType,
            args: cell.lock.args,
          };
          return (
            this.rgbppService.isRgbppLockScript(lock) || this.rgbppService.isBtcTimeLockScript(lock)
          );
        });
        if (hasRgbppOuputCell) {
          return false;
        }

        return true;
      });
      return isRgbppL2Tx;
    });
    return {
      ...block,
      txhashs: rgbppL2Txs.map((tx) => tx.hash),
    };
  }
}
