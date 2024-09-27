import { BI } from '@ckb-lumos/bi';
import { Injectable } from '@nestjs/common';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { CkbXUDTInfo } from 'src/modules/ckb/cell/cell.model';
import { RgbppAsset } from '../asset/asset.model';
import { CkbRpcWebsocketService } from 'src/core/ckb-rpc/ckb-rpc-websocket.service';
import { CKB_CHAIN_ID } from 'src/constants';
import { Cacheable } from 'src/decorators/cacheable.decorator';

@Injectable()
export class RgbppAddressService {
  constructor(
    private prismaService: PrismaService,
    private ckbExplorerService: CkbExplorerService,
    private ckbRpcService: CkbRpcWebsocketService,
  ) { }

  @Cacheable({
    namespace: 'RgbppAddressService',
    key: (address: string) => `getAddressAssets:${address}`,
    ttl: 10_000,
  })
  public async getAddressAssets(address: string) {
    const lockScript = await this.prismaService.lockScript.findMany({
      where: {
        ownerAddress: address,
        chainId: CKB_CHAIN_ID,
      },
    });
    if (lockScript.length === 0) {
      return [];
    }
    const results = await this.prismaService.asset.findMany({
      where: {
        lockScriptHash: {
          in: lockScript.map((script) => script.scriptHash),
        },
        isLive: true,
      },
    });
    if (results.length === 0) {
      return [];
    }
    const outputMap = results.reduce(
      (map, { txHash, index }) => {
        if (map[txHash] === undefined) {
          map[txHash] = [];
        }
        map[txHash].push(index);
        return map;
      },
      {} as Record<string, string[]>,
    );
    const assets = await Promise.all(
      Object.keys(outputMap).map(async (txHash) => {
        const tx = await this.ckbRpcService.getTransaction(txHash);
        return outputMap[txHash].map((index) =>
          RgbppAsset.fromTransaction(address, tx.transaction, BI.from(index).toNumber()),
        );
      }),
    );
    return assets.flat();
  }

  public async getAddressBalances(address: string): Promise<CkbXUDTInfo[]> {
    const result = await this.prismaService.holder.findMany({
      where: {
        address,
      },
      orderBy: {
        assetAmount: 'desc',
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
