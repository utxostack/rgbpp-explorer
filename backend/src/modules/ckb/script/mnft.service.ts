import { Script } from '@ckb-lumos/lumos';
import { Injectable, Logger } from '@nestjs/common';
import { MNFT_TYPESCRIPTS } from 'src/constants';
import { BaseScriptService } from './base/base-script.service';
import { CellType } from './script.model';

@Injectable()
export class MNFTService extends BaseScriptService {
  protected logger = new Logger(MNFTService.name);
  public type: CellType = CellType.MNFT;

  public getScripts(): Script[] {
    const networkType = this.configService.get('NETWORK');
    return MNFT_TYPESCRIPTS[networkType];
  }
}
