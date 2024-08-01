import { Module } from '@nestjs/common';
import { CkbScriptResolver } from './script.resolver';
import { ExtensibleUDTService } from './xudt.service';
import { SimpleUDTService } from './sudt.service';
import { DigitalObjectService } from './dob.service';
import { MNFTService } from './mnft.service';
import { CkbScriptService } from './script.service';
import { CkbRpcModule } from 'src/core/ckb-rpc/ckb-rpc.module';

@Module({
  imports: [CkbRpcModule],
  providers: [
    CkbScriptResolver,
    CkbScriptService,
    ExtensibleUDTService,
    SimpleUDTService,
    DigitalObjectService,
    MNFTService,
  ],
  exports: [CkbScriptService],
})
export class CkbScriptModule { }
