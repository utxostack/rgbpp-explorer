import { Script } from '@ckb-lumos/lumos';
import { Injectable, Logger } from '@nestjs/common';
import { NetworkType } from 'src/constants';
import { BaseScriptService } from './base/base-script.service';
import { CellType } from './script.model';

@Injectable()
export class MNFTService extends BaseScriptService {
  protected logger = new Logger(MNFTService.name);
  public type: CellType = CellType.MNFT;

  public static TestnetScripts: Script[] = [
    {
      codeHash: '0xb1837b5ad01a88558731953062d1f5cb547adf89ece01e8934a9f0aeed2d959f',
      hashType: 'type',
      args: '0x',
    },
  ];

  public static MainnetScripts: Script[] = [
    {
      codeHash: '0x2b24f0d644ccbdd77bbf86b27c8cca02efa0ad051e447c212636d9ee7acaaec9',
      hashType: 'type',
      args: '0x',
    },
  ];

  public getScripts(): Script[] {
    const networkType = this.configService.get('NETWORK');
    return networkType === NetworkType ? MNFTService.MainnetScripts : MNFTService.TestnetScripts;
  }
}
