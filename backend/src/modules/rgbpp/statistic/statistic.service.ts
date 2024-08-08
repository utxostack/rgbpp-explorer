import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ONE_DAY_MS } from 'src/common/date';
import { CkbRpcWebsocketService } from 'src/core/ckb-rpc/ckb-rpc-websocket.service';
import * as pLimit from 'p-limit';
import { BI } from '@ckb-lumos/bi';
import { CkbScriptService } from 'src/modules/ckb/script/script.service';
import { CellType } from 'src/modules/ckb/script/script.model';
import { isScriptEqual } from '@rgbpp-sdk/ckb';
import { HashType, Script } from '@ckb-lumos/lumos';
import { RgbppService } from '../rgbpp.service';

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
    private ckbScriptService: CkbScriptService,
    private rgbppService: RgbppService,
    @Inject(CACHE_MANAGER) protected cacheManager: Cache,
  ) {
    this.collectLatest24HourRgbppTransactions();
  }

  public async getLatest24L1Transactions() {
    const txids = await this.cacheManager.get(this.latest24L1TransactionsCacheKey);
    if (txids) {
      return txids as string[];
    }
    const { btcTxIds } = await this.collectLatest24HourRgbppTransactions();
    return btcTxIds;
  }

  public async getLatest24L2Transactions() {
    const txhashes = await this.cacheManager.get(this.latest24L2TransactionsCacheKey);
    if (txhashes) {
      return txhashes as string[];
    }
    const { ckbTxHashes } = await this.collectLatest24HourRgbppTransactions();
    return ckbTxHashes;
  }

  public async collectLatest24HourRgbppTransactions() {
    const tipBlockNumber = await this.ckbRpcService.getTipBlockNumber();
    this.logger.log(`Collect latest 24 hours RGB++ transactions, tip block number: ${tipBlockNumber}`);

    const blocks = await Promise.all(
      Array.from({ length: CKB_24_HOURS_BLOCK_NUMBER }).map((_, index) => {
        return limit(() =>
          this.getRgbppTxsByCkbBlockNumber(BI.from(tipBlockNumber).sub(index).toHexString()),
        );
      }),
    );
    const btcTxIds = blocks.flatMap((block) => block.btcTxIds);
    const ckbTxHashes = blocks.flatMap((block) => block.ckbTxHashes);
    await this.cacheManager.set(this.latest24L1TransactionsCacheKey, btcTxIds, ONE_DAY_MS);
    await this.cacheManager.set(this.latest24L2TransactionsCacheKey, ckbTxHashes, ONE_DAY_MS);
    this.logger.log(`Collect latest 24 hours RGB++ transactions done`);
    return {
      btcTxIds,
      ckbTxHashes,
    };
  }

  private async getRgbppTxsByCkbBlockNumber(blockNumber: string) {
    const block = await this.ckbRpcService.getBlockByNumber(blockNumber);
    const rgbppL1TxIds: string[] = [];
    const rgbppL2Txhashes: string[] = [];

    for (const tx of block.transactions) {
      const rgbppCell = tx.outputs.find((output) => {
        const lock: Script = {
          codeHash: output.lock.code_hash,
          hashType: output.lock.hash_type as HashType,
          args: output.lock.args,
        };
        return (
          this.rgbppService.isRgbppLockScript(lock) || this.rgbppService.isBtcTimeLockScript(lock)
        );
      });
      if (rgbppCell) {
        try {
          const { btcTxid } = this.rgbppService.parseRgbppLockArgs(rgbppCell.lock.args);
          rgbppL1TxIds.push(btcTxid);
        } catch {}
        continue;
      }

      const isRgbppL2Tx = tx.outputs.some((output) => {
        if (!output.type) {
          return false;
        }
        return this.rgbppAssetsTypeScripts.some((script) =>
          isScriptEqual(script, {
            codeHash: output.type!.code_hash,
            hashType: output.type!.hash_type as HashType,
            args: '0x',
          }),
        );
      });
      if (isRgbppL2Tx) {
        rgbppL2Txhashes.push(tx.hash);
      }
    }

    return {
      ...block,
      btcTxIds: rgbppL1TxIds,
      ckbTxHashes: rgbppL2Txhashes,
    };
  }
}
