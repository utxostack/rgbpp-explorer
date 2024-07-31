import { Inject, Injectable } from '@nestjs/common';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import { RgbppService } from '../rgbpp.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { TEN_MINUTES_MS } from 'src/common/date';
import * as CkbRpc from 'src/core/ckb-rpc/ckb-rpc.interface';
import * as BitcoinApi from 'src/core/bitcoin-api/bitcoin-api.interface';

@Injectable()
export class RgbppAddressService {
  private addressCellsCacheKey = `RgbppAddressService:cells`;

  constructor(
    private bitcoinApiService: BitcoinApiService,
    private rgbppService: RgbppService,
    @Inject(CACHE_MANAGER) protected cacheManager: Cache,
  ) {}

  public async getRgbppAddressCells(btcAddress: string) {
    const cached = await this.cacheManager.get<CkbRpc.Cell[]>(this.addressCellsCacheKey);
    if (cached) {
      return cached;
    }
    const cells = await this.collectRgbppAddressCells(btcAddress);
    await this.setRgbppAddressCells(cells);
    return cells;
  }

  public async setRgbppAddressCells(cells: CkbRpc.Cell[]) {
    await this.cacheManager.set(this.addressCellsCacheKey, cells, TEN_MINUTES_MS);
  }

  public async collectRgbppAddressCells(btcAddress: string): Promise<CkbRpc.Cell[]> {
    const addressTxsMap = new Map<string, BitcoinApi.Transaction>();
    let afterTxid = undefined;
    while (true) {
      const txs = await this.bitcoinApiService.getAddressTxs({ address: btcAddress, afterTxid });
      if (txs.length === 0 || afterTxid === txs[txs.length - 1].txid) {
        break;
      }
      afterTxid = txs[txs.length - 1].txid;
      txs.forEach((tx) => {
        addressTxsMap.set(tx.txid, tx);
      });
    }

    const cells = await this.rgbppService.getAllRgbppLockCells();
    return cells.filter((cell) => {
      try {
        const { args } = cell.output.lock;
        const { btcTxid, outIndex } = this.rgbppService.parseRgbppLockArgs(args);
        const tx = addressTxsMap.has(btcTxid);
        if (!tx) {
          return false;
        }
        const vout = addressTxsMap.get(btcTxid).vout;
        if (!vout[outIndex]) {
          return false;
        }
        const { scriptpubkey_address } = vout[outIndex];
        if (scriptpubkey_address !== btcAddress) {
          return false;
        }
        return true;
      } catch (err) {
        return false;
      }
    });
  }
}
