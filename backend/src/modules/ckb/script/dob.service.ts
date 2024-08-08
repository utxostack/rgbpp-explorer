import { Script } from '@ckb-lumos/lumos';
import { Injectable, Logger } from '@nestjs/common';
import { getClusterTypeScript, getSporeTypeScript } from '@rgbpp-sdk/ckb';
import { NetworkType } from 'src/constants';
import { BaseScriptService } from './base/base-script.service';
import { CellType } from './script.model';

@Injectable()
export class DigitalObjectService extends BaseScriptService {
  protected logger = new Logger(DigitalObjectService.name);
  public type: CellType = CellType.DOB;

  public static TestnetScripts: Script[] = [
    {
      ...getSporeTypeScript(false),
      args: '0x',
    },
    {
      ...getClusterTypeScript(false),
      args: '0x',
    },
  ];
  public static MainnetScripts: Script[] = [
    {
      ...getSporeTypeScript(true),
      args: '0x',
    },
    {
      ...getClusterTypeScript(true),
      args: '0x',
    },
  ];

  public getScripts(): Script[] {
    const networkType = this.configService.get('NETWORK');
    return networkType === NetworkType.mainnet
      ? DigitalObjectService.MainnetScripts
      : DigitalObjectService.TestnetScripts;
  }
}
