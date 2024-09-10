import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { Holder } from '@prisma/client';
import { BI } from '@ckb-lumos/bi';

export interface GetCoinHoldersParams {
  page: number;
  pageSize?: number;
  order?: 'asc' | 'desc';
  isLayer1?: boolean;
}

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
    { page = 1, pageSize = 10, order, isLayer1 }: GetCoinHoldersParams,
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
          assetAmount: order ?? 'desc',
        },
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
    const holders = results.map((result) => ({
      address: result.address,
      assetCount: result._sum.assetCount || 0,
      assetAmount: result._sum.assetAmount?.toHex() ?? '0x0',
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
    return result._sum.assetAmount?.toHex() ?? '0x0';
  }
}
