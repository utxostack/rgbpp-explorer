import { BI } from '@ckb-lumos/bi';
import { Injectable } from '@nestjs/common';
import { ONE_MINUTE_MS } from 'src/common/date';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import { CkbRpcWebsocketService } from 'src/core/ckb-rpc/ckb-rpc-websocket.service';
import * as CkbRpc from 'src/core/ckb-rpc/ckb-rpc.interface';
import { RgbppCoreService } from 'src/core/rgbpp/rgbpp.service';
import { Cacheable } from 'src/decorators/cacheable.decorator';

@Injectable()
export class RgbppService {
  constructor(
    private rgbppCoreService: RgbppCoreService,
    private ckbExplorerService: CkbExplorerService,
    private ckbRpcService: CkbRpcWebsocketService,
  ) {}

  @Cacheable({
    key: 'RgbppService:getAllRgbppLockCells',
    ttl: ONE_MINUTE_MS,
  })
  public async getAllRgbppLockCells(): Promise<CkbRpc.Cell[]> {
    const rgbppTxs = await this.ckbExplorerService.getRgbppTransactions();
    const rgbppLockScript = this.rgbppCoreService.rgbppLockScript;
    const cells = await this.ckbRpcService.getCells(
      {
        script: {
          code_hash: rgbppLockScript.codeHash,
          hash_type: rgbppLockScript.hashType,
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
}
