import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { Holder, LeapDirection } from '@prisma/client';
import { CKB_CHAIN_ID } from 'src/constants';

export interface GetRgbppAssetsHoldersParams {
  page: number;
  pageSize?: number;
  order?: 'asc' | 'desc';
  isLayer1?: boolean;
}

@Injectable()
export class RgbppStatisticService {
  constructor(private prismaService: PrismaService) { }

  public async getLatest24L1Transactions(leapDirection?: LeapDirection) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const transactions = await this.prismaService.transaction.findMany({
      where: {
        chainId: CKB_CHAIN_ID,
        isRgbpp: true,
        block: {
          timestamp: {
            gte: twentyFourHoursAgo,
          },
        },
        ...(leapDirection ? { leapDirection } : {}),
      },
    });
    console.log(transactions);
    return transactions;
  }

  public async getLatest24L2Transactions() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const transactions = await this.prismaService.transaction.findMany({
      where: {
        isRgbpp: false,
        block: {
          timestamp: {
            gte: twentyFourHoursAgo,
          },
        },
      },
    });
    return transactions;
  }

  public async getRgbppAssetsHoldersCount(isLayer1: boolean): Promise<number> {
    const results = await this.prismaService.holder.groupBy({
      by: ['address'],
      where: {
        isLayer1,
      },
    });
    return results.length;
  }

  public async getRgbppAssetsHolders({
    page,
    pageSize = 10,
    order,
    isLayer1,
  }: GetRgbppAssetsHoldersParams): Promise<Pick<Holder, 'address' | 'assetCount'>[]> {
    const results = await this.prismaService.holder.groupBy({
      by: ['address'],
      where: {
        isLayer1,
      },
      _sum: {
        assetCount: true,
      },
      orderBy: {
        _sum: {
          assetCount: order ?? 'desc',
        },
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
    const holders = results.map((result) => ({
      address: result.address,
      assetCount: result._sum.assetCount || 0,
    }));
    return holders;
  }
}
