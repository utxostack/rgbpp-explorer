import { Injectable } from '@nestjs/common';
import * as CkbExplorer from 'src/core/ckb-explorer/ckb-explorer.interface';
import { CkbBaseCell, CkbXUDTInfo } from './cell.model';
import { BI, Script } from '@ckb-lumos/lumos';
import { computeScriptHash } from '@ckb-lumos/lumos/utils';

@Injectable()
export class CkbCellService {
  public getXUDTInfoFromOutput(cell: CkbBaseCell, output: CkbExplorer.DisplayOutput): CkbXUDTInfo {
    const info = output.xudt_info || output.omiga_inscription_info;
    if (!info) {
      return null;
    }
    const xudtInfo: CkbXUDTInfo = {
      symbol: info.symbol,
      amount: BI.from(info.amount).toHexString(),
      decimal: BI.from(info.decimal).toNumber(),
      typeHash: computeScriptHash(cell.type as Script),
    };
    return xudtInfo;
  }
}
