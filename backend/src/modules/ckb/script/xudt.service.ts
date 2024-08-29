import { Script } from '@ckb-lumos/lumos';
import { Injectable, Logger } from '@nestjs/common';
import { XUDT_TYPESCRIPTS } from 'src/constants';
import { BaseScriptService } from './base/base-script.service';
import { CellType } from './script.model';

@Injectable()
export class ExtensibleUDTService extends BaseScriptService {
  protected logger = new Logger(ExtensibleUDTService.name);
  public type: CellType = CellType.XUDT;

  public getScripts(): Script[] {
    const networkType = this.configService.get('NETWORK');
    return XUDT_TYPESCRIPTS[networkType]
  }
}
