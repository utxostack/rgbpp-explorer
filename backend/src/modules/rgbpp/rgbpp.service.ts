import { BI } from '@ckb-lumos/bi';
import { bytes } from '@ckb-lumos/lumos/codec';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getRgbppLockScript, remove0x, RGBPPLock } from '@rgbpp-sdk/ckb';
import { ONE_MINUTE_MS } from 'src/common/date';
import { BtcTestnetTypeMap, NetworkType } from 'src/constants';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import { CkbRpcWebsocketService } from 'src/core/ckb-rpc/ckb-rpc-websocket.service';
import * as CkbRpc from 'src/core/ckb-rpc/ckb-rpc.interface';
import { Cacheable } from 'src/decorators/cacheable.decorator';
import { Env } from 'src/env';

@Injectable()
export class RgbppService {
  constructor(
    private configService: ConfigService<Env>,
    private ckbExplorerService: CkbExplorerService,
    private ckbRpcService: CkbRpcWebsocketService,
  ) {}

  @Cacheable({
    key: 'RgbppService:getAllRgbppLockCells',
    ttl: ONE_MINUTE_MS,
  })
  public async getAllRgbppLockCells(): Promise<CkbRpc.Cell[]> {
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
      // rgbppTxs.meta.total * 10 is a rough estimation of the number of cells
      BI.from(rgbppTxs.meta.total * 10).toHexString(),
    );
    return cells.objects;
  }

  public parseRgbppLockArgs(args: string): { outIndex: number; btcTxid: string } {
    const unpack = RGBPPLock.unpack(args);
    const btcTxid = bytes.hexify(bytes.bytify(unpack.btcTxid).reverse());
    return {
      outIndex: unpack.outIndex,
      btcTxid: remove0x(btcTxid),
    };
  }
}
