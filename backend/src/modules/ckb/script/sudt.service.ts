import { Script } from '@ckb-lumos/lumos';
import { Injectable, Logger } from '@nestjs/common';
import { SUDT_TYPESCRIPTS } from 'src/constants';
import { BaseScriptService } from './base/base-script.service';
import { CellType } from './script.model';

@Injectable()
export class SimpleUDTService extends BaseScriptService {
  protected logger = new Logger(SimpleUDTService.name);
  public type: CellType = CellType.SUDT;

  public getScripts(): Script[] {
    const networkType = this.configService.get('NETWORK');
    return SUDT_TYPESCRIPTS[networkType];
  }
}
