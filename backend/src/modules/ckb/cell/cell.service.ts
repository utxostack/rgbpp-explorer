import { Injectable } from '@nestjs/common';
import * as CkbExplorer from 'src/core/ckb-explorer/ckb-explorer.interface';
import { CkbCell, CkbXUDTInfo } from './cell.model';
import { BI, Script } from '@ckb-lumos/lumos';
import { computeScriptHash } from '@ckb-lumos/lumos/utils';

@Injectable()
export class CkbCellService {
  public getXUDTInfoFromOutput(
    cell: CkbCell,
    output: CkbExplorer.DisplayOutput,
  ): CkbXUDTInfo | null {
    const info = output.xudt_info || output.omiga_inscription_info;
    if (!info) {
      return null;
    }
    const xudtInfo: CkbXUDTInfo = {
      symbol: info.symbol,
      amount: BI.from(info.amount || '0').toHexString(),
      decimal: BI.from(info.decimal || '8').toNumber(),
      typeHash: computeScriptHash(cell.type as Script),
    };
    return xudtInfo;
  }
}
