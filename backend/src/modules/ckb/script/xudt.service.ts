import { Script } from '@ckb-lumos/lumos';
import { Injectable, Logger } from '@nestjs/common';
import { NetworkType } from 'src/constants';
import { BaseScriptService } from './base/base-script.service';
import { CellType } from './script.model';

@Injectable()
export class ExtensibleUDTService extends BaseScriptService {
  protected logger = new Logger(ExtensibleUDTService.name);
  public type: CellType = CellType.XUDT;

  public static TestnetScripts: Script[] = [
    // https://pudge.explorer.nervos.org/scripts#xUDT(final_rls)
    {
      codeHash: '0x25c29dc317811a6f6f3985a7a9ebc4838bd388d19d0feeecf0bcd60f6c0975bb',
      hashType: 'type',
      args: '0x',
    },
    // https://pudge.explorer.nervos.org/scripts#xUDT
    {
      codeHash: '0x50bd8d6680b8b9cf98b73f3c08faf8b2a21914311954118ad6609be6e78a1b95',
      hashType: 'data1',
      args: '0x',
    },
  ];

  public static MainnetScripts: Script[] = [
    // https://explorer.nervos.org/scripts#xUDT
    {
      codeHash: '0x50bd8d6680b8b9cf98b73f3c08faf8b2a21914311954118ad6609be6e78a1b95',
      hashType: 'data1',
      args: '0x',
    },
  ];

  public getScripts(): Script[] {
    const networkType = this.configService.get('NETWORK');
    return networkType === NetworkType.mainnet
      ? ExtensibleUDTService.MainnetScripts
      : ExtensibleUDTService.TestnetScripts;
  }
}
