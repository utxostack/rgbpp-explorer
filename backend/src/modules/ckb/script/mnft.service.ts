import { Script } from '@ckb-lumos/lumos';
import { Injectable, Logger } from '@nestjs/common';
import { MNFT_TYPESCRIPTS } from 'src/constants';
import { BaseScriptService } from './base/base-script.service';
import { CellType } from './script.model';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/env';
import { CkbRpcWebsocketService } from 'src/core/ckb-rpc/ckb-rpc-websocket.service';

@Injectable()
export class MNFTService extends BaseScriptService {
  protected logger = new Logger(MNFTService.name);
  public type: CellType = CellType.MNFT;

  constructor(configService: ConfigService<Env>, ckbRpcService: CkbRpcWebsocketService) {
    super(configService, ckbRpcService);
  }

  public getScripts(): Script[] {
    const networkType = this.configService.get('NETWORK');
    return MNFT_TYPESCRIPTS[networkType];
  }
}
