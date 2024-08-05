import { Script } from '@ckb-lumos/lumos';
import { Injectable, Logger } from '@nestjs/common';
import { NetworkType } from 'src/constants';
import { BaseScriptService } from './base/base-script.service';
import { CellType } from './script.model';

@Injectable()
export class SimpleUDTService extends BaseScriptService {
  protected logger = new Logger(SimpleUDTService.name);
  public type: CellType = CellType.SUDT;

  public static TestnetScripts: Script[] = [
    // https://pudge.explorer.nervos.org/scripts#sudt
    {
      codeHash: '0xc5e5dcf215925f7ef4dfaf5f4b4f105bc321c02776d6e7d52a1db3fcd9d011a4',
      hashType: 'type',
      args: '0x',
    },
  ];

  public static MainnetScripts: Script[] = [
    // https://explorer.nervos.org/scripts#sudt
    {
      codeHash: '0x5e7a36a77e68eecc013dfa2fe6a23f3b6c344b04005808694ae6dd45eea4cfd5',
      hashType: 'type',
      args: '0x',
    },
  ];

  public getScripts(): Script[] {
    const networkType = this.configService.get('NETWORK');
    return networkType === NetworkType.mainnet
      ? SimpleUDTService.MainnetScripts
      : SimpleUDTService.TestnetScripts;
  }
}
