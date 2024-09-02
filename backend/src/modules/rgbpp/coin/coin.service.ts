import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { Holder } from '@prisma/client';

@Injectable()
export class RgbppCoinService {
  constructor(
    private prismaService: PrismaService,
    @Inject(CACHE_MANAGER) protected cacheManager: Cache,
  ) { }

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
    }));
    return holders;
  }
}
