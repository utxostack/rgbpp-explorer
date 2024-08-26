import { Injectable, Logger } from '@nestjs/common';
import { Chain } from '@prisma/client';
import { BaseProcessor } from './base.processor';
import { RgbppCoreService } from 'src/core/rgbpp/rgbpp.service';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { Script } from '@ckb-lumos/lumos';

export interface IndexerTypeScriptData {
  chain: Chain;
  script: Script;
  scriptHash: string;
}

@Injectable()
export class TypeScriptProcessor extends BaseProcessor<IndexerTypeScriptData> {
  private logger = new Logger(TypeScriptProcessor.name);

  constructor(private prismaService: PrismaService) {
    super();
  }

  public async process(data: IndexerTypeScriptData): Promise<void> {
    const { chain, script, scriptHash } = data;
    this.logger.debug(`Processing type script ${scriptHash} for chain ${chain.name}`);

    await this.prismaService.$transaction(async (tx) => {
      const existTypeScript = await tx.typeScript.findUnique({
        where: {
          chainId_scriptHash: {
            chainId: chain.id,
            scriptHash,
          },
        },
      });
      if (existTypeScript) {
        return;
      }

      try {
        await tx.typeScript.upsert({
          where: {
            chainId_scriptHash: {
              chainId: chain.id,
              scriptHash,
            },
          },
          update: {},
          create: {
            chainId: chain.id,
            codeHash: script.codeHash,
            hashType: script.hashType,
            args: script.args,
            scriptHash,
          },
        });
      } catch (err) {
        this.logger.error(`Error processing type script ${scriptHash} for chain ${chain.name}`);
        this.logger.error(err);
      }
    });
  }
}
