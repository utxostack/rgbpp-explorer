import { Inject, Injectable } from '@nestjs/common';
import { BitcoinApiService } from 'src/core/bitcoin-api/bitcoin-api.service';
import { RgbppService } from '../rgbpp.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { TEN_MINUTES_MS } from 'src/common/date';
import * as CkbRpc from 'src/core/ckb-rpc/ckb-rpc.interface';
import * as BitcoinApi from 'src/core/bitcoin-api/bitcoin-api.interface';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class RgbppAddressService {
  private addressCellsCacheKey = `RgbppAddressService:cells`;

  constructor(
    private bitcoinApiService: BitcoinApiService,
    private rgbppService: RgbppService,
    @Inject(CACHE_MANAGER) protected cacheManager: Cache,
    @InjectQueue('rgbpp-address') private readonly queue: Queue,
  ) { }

  public async getRgbppAddressCells(btcAddress: string) {
    const key = `${this.addressCellsCacheKey}:${btcAddress}`;
    const cached = await this.cacheManager.get<CkbRpc.Cell[]>(key);
    if (cached) {
      this.queue.add(
        'collect-rgbpp-address-cells',
        { btcAddress },
        {
          debounce: {
            id: btcAddress,
            ttl: 60 * 1000,
          },
        },
      );
      return cached;
    }
    const cells = await this.collectRgbppAddressCells(btcAddress);
    await this.setRgbppAddressCells(btcAddress, cells);
    return cells;
  }

  public async setRgbppAddressCells(btcAddress: string, cells: CkbRpc.Cell[]) {
    await this.cacheManager.set(`${this.addressCellsCacheKey}:${btcAddress}`, cells, TEN_MINUTES_MS);
  }

  public async collectRgbppAddressCells(btcAddress: string): Promise<CkbRpc.Cell[]> {
    const addressTxsMap = new Map<string, BitcoinApi.Transaction>();
    let afterTxid: string | undefined = undefined;
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
        const vout = addressTxsMap.get(btcTxid)!.vout;
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
