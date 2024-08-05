import { BadRequestException, Injectable } from '@nestjs/common';
import { ExtensibleUDTService } from './xudt.service';
import { SimpleUDTService } from './sudt.service';
import { DigitalObjectService } from './dob.service';
import { MNFTService } from './mnft.service';
import { CellType } from './script.model';
import { Script } from '@ckb-lumos/lumos';
import { BaseScriptService } from './base/base-script.service';

@Injectable()
export class CkbScriptService {
  private scriptServices: BaseScriptService[];

  constructor(
    private extensibleUDTService: ExtensibleUDTService,
    private simpleUDTService: SimpleUDTService,
    private digitalObjectService: DigitalObjectService,
    private mNFTService: MNFTService,
  ) {
    this.scriptServices = [
      extensibleUDTService,
      simpleUDTService,
      digitalObjectService,
      mNFTService,
    ];
  }

  public getServiceByCellType(cellType: CellType) {
    switch (cellType) {
      case CellType.XUDT:
        return this.extensibleUDTService;
      case CellType.SUDT:
        return this.simpleUDTService;
      case CellType.DOB:
        return this.digitalObjectService;
      case CellType.MNFT:
        return this.mNFTService;
      default:
        throw new BadRequestException(`Unsupported cell type: ${cellType}`);
    }
  }

  public getCellTypeByScript(script: Script): CellType {
    for (const service of this.scriptServices) {
      if (service.getScripts().some((s) => s.codeHash === script.codeHash)) {
        return service.type;
      }
    }
    throw new BadRequestException(`Unsupported script: ${JSON.stringify(script)}`);
  }
}
