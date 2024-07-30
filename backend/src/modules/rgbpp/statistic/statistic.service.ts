import { BI } from '@ckb-lumos/bi';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getRgbppLockScript, remove0x, RGBPPLock } from '@rgbpp-sdk/ckb';
import { BtcTestnetTypeMap, NetworkType } from 'src/constants';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import { CkbRpcWebsocketService } from 'src/core/ckb-rpc/ckb-rpc-websocket.service';
import { Env } from 'src/env';
import * as pLimit from 'p-limit';
import { bytes } from '@ckb-lumos/lumos/codec';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { TEN_MINUTES_MS } from 'src/common/date';

const limit = pLimit(100);

@Injectable()
export class RgbppStatisticService {
  private holdersCacheKey = `RgbppStatisticService:holders`;

  constructor(
    private configService: ConfigService<Env>,
    private bitcoinApiService: BitcoinApiService,
    private ckbExplorerService: CkbExplorerService,
    private ckbRpcService: CkbRpcWebsocketService,
    @Inject(CACHE_MANAGER) protected cacheManager: Cache,
  ) { }

  public async getRgbppAssetsHolders() {
    const cached = await this.cacheManager.get<string[]>(this.holdersCacheKey);
    if (cached) {
      return cached;
    }
    const holders = await this.collectRgbppAssetsHolders();
    await this.setRgbppAssetsHolders(holders);
    return holders;
  }

  public async setRgbppAssetsHolders(holders: string[]) {
    await this.cacheManager.set(this.holdersCacheKey, holders, TEN_MINUTES_MS);
  }

  public async collectRgbppAssetsHolders() {
    const network = this.configService.get('NETWORK');
    const rgbppLock = getRgbppLockScript(
      network === NetworkType.mainnet,
      BtcTestnetTypeMap[network],
    );
    const rgbppTxs = await this.ckbExplorerService.getRgbppTransactions();
    const cells = await this.ckbRpcService.getCells(
      {
        script: {
          code_hash: rgbppLock.codeHash,
          hash_type: rgbppLock.hashType,
          args: '0x',
        },
        script_type: 'lock',
      },
      'desc',
      BI.from(rgbppTxs.meta.total * 10).toHexString(),
    );

    const utxos = cells.objects
      .map((cell) => {
        const { args } = cell.output.lock;
        try {
          const unpack = RGBPPLock.unpack(args);
          const btcTxid = bytes.hexify(bytes.bytify(unpack.btcTxid).reverse());
          return {
            outIndex: unpack.outIndex,
            btcTxid: remove0x(btcTxid),
          };
        } catch {
          return null;
        }
      })
      .filter((utxo) => utxo !== null);

    const txidSet = new Set(utxos.map((utxo) => utxo.btcTxid));
    const txs = await Promise.allSettled(
      Array.from(txidSet).map((txid) =>
        limit(async () => {
          const tx = await this.bitcoinApiService.getTx({ txid });
          return tx;
        }),
      ),
    );

    const holdersSet = txs.reduce((set, tx) => {
      if (tx.status === 'fulfilled') {
        const { vout } = tx.value;
        const boundUtxos = utxos.filter((utxo) => utxo.btcTxid === tx.value.txid);
        boundUtxos.forEach(({ outIndex }) => {
          const output = vout[outIndex];
          if (!output) {
            return;
          }
          const { scriptpubkey } = output;
          if (scriptpubkey) {
            set.add(scriptpubkey);
          }
        });
      }
      return set;
    }, new Set<string>());
    return Array.from(holdersSet);
  }
}
