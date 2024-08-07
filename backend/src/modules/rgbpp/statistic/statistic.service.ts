import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ONE_DAY_MS, TEN_MINUTES_MS } from 'src/common/date';
import { RgbppService } from '../rgbpp.service';
import { CkbRpcWebsocketService } from 'src/core/ckb-rpc/ckb-rpc-websocket.service';
import * as pLimit from 'p-limit';
import { BI } from '@ckb-lumos/bi';
import { CkbScriptService } from 'src/modules/ckb/script/script.service';
import { CellType } from 'src/modules/ckb/script/script.model';
import {
  buildRgbppLockArgs,
  genRgbppLockScript,
  getRgbppLockScript,
  isRgbppLockCell,
  isScriptEqual,
} from '@rgbpp-sdk/ckb';
import { HashType } from '@ckb-lumos/lumos';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/env';
import { BtcTestnetTypeMap, CKB_MIN_SAFE_CONFIRMATIONS, NetworkType } from 'src/constants';
import { Cacheable } from 'src/decorators/cacheable.decorator';
import * as CkbRpcInterface from 'src/core/ckb-rpc/ckb-rpc.interface';
import * as BitcoinApiInterface from 'src/core/bitcoin-api/bitcoin-api.interface';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';

const BTC_24_HOURS_BLOCK_NUMBER = ONE_DAY_MS / TEN_MINUTES_MS;
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
    private configService: ConfigService<Env>,
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
    const txids = await this.cacheManager.get(this.latest24L2TransactionsCacheKey);
    if (txids) {
      return txids as string[];
    }
    return this.collectLatest24L2Transactions();
  }

  public async collectLatest24L1Transactions() {
    const info = await this.bitcoinApiService.getBlockchainInfo();
    this.logger.log(
      `Collecting latest 24 hours L1 transactions from block ${info.blocks - BTC_24_HOURS_BLOCK_NUMBER}`,
    );
    const blocks = await Promise.all(
      Array.from({ length: BTC_24_HOURS_BLOCK_NUMBER }).map((_, index) => {
        return limit(() => this.getRgbppL1TxidsByBlockNumber(info.blocks - index));
      }),
    );
    const txids = blocks
      .flat()
      .map(({ txids }) => txids)
      .flat();
    await this.cacheManager.set(this.latest24L1TransactionsCacheKey, txids);
    return txids;
  }

  public async collectLatest24L2Transactions() {
    const tipBlockNumber = await this.ckbRpcService.getTipBlockNumber();
    this.logger.log(
      `Collecting latest 24 hours L2 transactions from block ${tipBlockNumber - CKB_24_HOURS_BLOCK_NUMBER}`,
    );

    const blocks = await Promise.all(
      Array.from({ length: CKB_24_HOURS_BLOCK_NUMBER }).map((_, index) => {
        return limit(() =>
          this.getRgbppL2TxHashsByBlockNumber(BI.from(tipBlockNumber).sub(index).toHexString()),
        );
      }),
    );
    const txhashs = blocks
      .flat()
      .map(({ txhashs }) => txhashs)
      .flat();
    await this.cacheManager.set(this.latest24L2TransactionsCacheKey, txhashs);
    return txhashs;
  }

  private getRgbppLockScript() {
    const network = this.configService.get('NETWORK');
    const rgbppLockScript = getRgbppLockScript(
      network === NetworkType.mainnet,
      BtcTestnetTypeMap[network],
    );
    return rgbppLockScript;
  }

  @Cacheable({
    namespace: 'RgbppStatisticService',
    key: (blockNumber: string) => `getRgbppL1TxidsByBlockNumber:${blockNumber}`,
    ttl: ONE_DAY_MS,
    shouldCache: async (block: BitcoinApiInterface.Block, that: RgbppStatisticService) => {
      const info = await that.bitcoinApiService.getBlockchainInfo();
      return block.height < info.blocks;
    },
  })
  private async getRgbppL1TxidsByBlockNumber(blockHeight: number) {
    const hash = await this.bitcoinApiService.getBlockHeight({ height: blockHeight });
    const block = await this.bitcoinApiService.getBlock({ hash });
    const blockTxs = await this.bitcoinApiService.getBlockTxs({ hash });
    const network = this.configService.get('NETWORK');

    const txs = await Promise.all(
      blockTxs.map(async (tx: BitcoinApiInterface.Transaction) => {
        const { txid, vout } = tx;
        for (let index = 0; index < vout.length; index += 1) {
          const args = buildRgbppLockArgs(index, txid);
          const rgbppLock = genRgbppLockScript(args, network === NetworkType.mainnet);
          const searchKey: CkbRpcInterface.SearchKey = {
            script: {
              code_hash: rgbppLock.codeHash,
              hash_type: rgbppLock.hashType,
              args: rgbppLock.args,
            },
            script_type: 'lock',
          };
          const ckbTxs = await this.ckbRpcService.getTransactions(searchKey, 'desc', '0x1');
          if (ckbTxs.objects.length > 0) {
            return txid;
          }
        }
        return null;
      }),
    );
    const txids = txs.filter((txid) => txid !== null);
    return {
      ...block,
      txids,
    };
  }

  @Cacheable({
    namespace: 'RgbppStatisticService',
    key: (blockNumber: string) => `getRgbppL2TxsByBlockNumber:${blockNumber}`,
    ttl: ONE_DAY_MS,
    shouldCache: async (block: CkbRpcInterface.Block, that: RgbppStatisticService) => {
      const tipBlockNumber = await that.ckbRpcService.getTipBlockNumber();
      if (!block.header?.number) {
        return false;
      }
      return BI.from(block.header.number).lt(
        BI.from(tipBlockNumber).sub(CKB_MIN_SAFE_CONFIRMATIONS),
      );
    },
  })
  private async getRgbppL2TxHashsByBlockNumber(blockNumber: string) {
    const block = await this.ckbRpcService.getBlockByNumber(blockNumber);
    const rgbppLockScript = this.getRgbppLockScript();
    const rgbppL2Txs = block.transactions.filter((tx) => {
      const isRgbppL2Tx = tx.outputs.some((output) => {
        if (!output.type) {
          return false;
        }
        const hasRgbppLockCell = tx.outputs.some((cell) =>
          isScriptEqual(
            {
              codeHash: cell.lock.code_hash,
              hashType: cell.lock.hash_type as HashType,
              args: '0x',
            },
            rgbppLockScript,
          ),
        );
        if (hasRgbppLockCell) {
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
      return isRgbppL2Tx;
    });
    return {
      ...block,
      txhashs: rgbppL2Txs.map((tx) => tx.hash),
    };
  }
}
