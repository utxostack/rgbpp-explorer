import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { Holder } from '@prisma/client';
import { BI } from '@ckb-lumos/bi';

@Injectable()
export class RgbppCoinService {
  constructor(
    private prismaService: PrismaService,
    @Inject(CACHE_MANAGER) protected cacheManager: Cache,
  ) { }

  public async getCoinHoldersCount(scriptHash: string, isLayer1?: boolean): Promise<number> {
    const results = await this.prismaService.holder.groupBy({
      by: ['address'],
      where: {
        typeScriptHash: scriptHash,
        ...(isLayer1 !== undefined && { isLayer1 }),
      },
    });
    return results.length;
  }

  public async getCoinHolders(
    scriptHash: string,
    isLayer1?: boolean,
    order?: 'asc' | 'desc',
    limit?: number,
  ): Promise<Pick<Holder, 'address' | 'assetCount'>[]> {
    const results = await this.prismaService.holder.groupBy({
      by: ['address'],
      where: {
        typeScriptHash: scriptHash,
        ...(isLayer1 !== undefined && { isLayer1 }),
      },
      _sum: {
        assetCount: true,
        assetAmount: true,
      },
      orderBy: {
        _sum: {
          assetCount: order ?? 'desc',
        },
      },
      ...(limit !== undefined && { take: limit }),
    });
    const holders = results.map((result) => ({
      address: result.address,
      assetCount: result._sum.assetCount || 0,
      assetAmount: BI.from(result._sum.assetAmount || 0).toHexString(),
    }));
    return holders;
  }

  public async getCoinAmount(scriptHash: string, isLayer1?: boolean): Promise<string> {
    const result = await this.prismaService.holder.aggregate({
      _sum: {
        assetAmount: true,
      },
      where: {
        typeScriptHash: scriptHash,
        ...(isLayer1 !== undefined && { isLayer1 }),
      },
    });
    return BI.from(result._sum.assetAmount || 0).toHexString();
  }
}
