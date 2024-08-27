import { Injectable, Logger } from '@nestjs/common';
import { Chain } from '@prisma/client';
import { BaseProcessor } from './base.processor';
import { RgbppCoreService } from 'src/core/rgbpp/rgbpp.service';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { Script } from '@ckb-lumos/lumos';

export interface IndexerLockScriptData {
  chain: Chain;
  script: Script;
  scriptHash: string;
}

@Injectable()
export class LockScriptProcessor extends BaseProcessor<IndexerLockScriptData> {
  private logger = new Logger(LockScriptProcessor.name);

  constructor(
    private prismaService: PrismaService,
    private rgbppCoreService: RgbppCoreService,
  ) {
    super();
  }

  public async process(data: IndexerLockScriptData): Promise<void> {
    const { chain, script, scriptHash } = data;
    this.logger.debug(`Processing lock script ${scriptHash} for chain ${chain.name}`);

    const existLockScript = await this.prismaService.lockScript.findUnique({
      where: {
        chainId_scriptHash: {
          chainId: chain.id,
          scriptHash,
        },
      },
    });
    if (existLockScript) {
      return;
    }

    const isRgbppLock = this.rgbppCoreService.isRgbppLockScript(script);
    const isBtcTimeLock = this.rgbppCoreService.isBtcTimeLockScript(script);
    try {
      await this.prismaService.lockScript.upsert({
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
          isRgbppLock,
          isBtcTimeLock,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to upsert lockScript: ${scriptHash} for chain ${chain.name}`);
      this.logger.error(err);
    }
  }
}
