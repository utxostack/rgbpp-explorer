import { BI } from '@ckb-lumos/bi';
import { Injectable } from '@nestjs/common';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { CkbXUDTInfo } from 'src/modules/ckb/cell/cell.model';

@Injectable()
export class RgbppAddressService {
  constructor(
    private prismaService: PrismaService,
    private ckbExplorerService: CkbExplorerService,
  ) { }

  public async getAddressBalances(address: string): Promise<CkbXUDTInfo[]> {
    const result = await this.prismaService.holder.findMany({
      where: {
        address,
      },
    });
    const balances = await Promise.all(
      result.map(async ({ typeScriptHash, assetAmount }) => {
        const info = await this.ckbExplorerService.getXUDT(typeScriptHash);
        const xudtInfo: CkbXUDTInfo = {
          symbol: info.data.attributes.symbol,
          decimal: BI.from(info.data.attributes.decimal).toNumber(),
          typeHash: typeScriptHash,
          amount: assetAmount.toHex(),
        };
        return xudtInfo;
      }),
    );
    return balances;
  }
}
