import { Script } from '@ckb-lumos/lumos';
import { Injectable, Logger } from '@nestjs/common';
import { DOB_TYPESCRIPTS } from 'src/constants';
import { BaseScriptService } from './base/base-script.service';
import { CellType } from './script.model';

@Injectable()
export class DigitalObjectService extends BaseScriptService {
  protected logger = new Logger(DigitalObjectService.name);
  public type: CellType = CellType.DOB;

  public getScripts(): Script[] {
    const networkType = this.configService.get('NETWORK');
    return DOB_TYPESCRIPTS[networkType];
  }
}
