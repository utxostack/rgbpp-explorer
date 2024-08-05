import { Inject, Injectable } from '@nestjs/common';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import * as pLimit from 'p-limit';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { TEN_MINUTES_MS } from 'src/common/date';
import { RgbppService } from '../rgbpp.service';

const limit = pLimit(100);

@Injectable()
export class RgbppStatisticService {
  private holdersCacheKey = `RgbppStatisticService:holders`;

  constructor(
    private bitcoinApiService: BitcoinApiService,
    private rgbppService: RgbppService,
    @Inject(CACHE_MANAGER) protected cacheManager: Cache,
  ) {}

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
    const cells = await this.rgbppService.getAllRgbppLockCells();
    const utxos = cells
      .map((cell) => {
        const { args } = cell.output.lock;
        try {
          const data = this.rgbppService.parseRgbppLockArgs(args);
          return data;
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
          const { scriptpubkey_address } = output;
          if (scriptpubkey_address) {
            set.add(scriptpubkey_address);
          }
        });
      }
      return set;
    }, new Set<string>());
    return Array.from(holdersSet);
  }
}
