import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/data/prisma/prisma.service';

@Injectable()
export class BlockService {
  constructor(private prisma: PrismaService) {}

  public async getBlockByHash(hash: string) {
    const block = await this.prisma.block.findUnique({
      where: {
        blockHash: hash,
      },
    });
    return block;
  }
}
