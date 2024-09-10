import { Script } from '@ckb-lumos/lumos';
import { bytes } from '@ckb-lumos/lumos/codec';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  getBtcTimeLockScript,
  getRgbppLockScript,
  isScriptEqual,
  remove0x,
  RGBPPLock,
} from '@rgbpp-sdk/ckb';
import { BtcTestnetTypeMap, NetworkType } from 'src/constants';
import { Env } from 'src/env';

export enum LeapDirection {
  LeapIn = 'leap_in',
  LeapOut = 'leap_out',
  Within = 'within',
}

export const CELLBASE_TX_HASH =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

@Injectable()
export class CoreService {
  constructor(private configService: ConfigService<Env>) {}

  public get rgbppLockScript() {
    const network = this.configService.get('NETWORK');
    const lockScript = getRgbppLockScript(
      network === NetworkType.mainnet,
      BtcTestnetTypeMap[network],
    );
    return lockScript;
  }

  public get btcTimeLockScript() {
    const network = this.configService.get('NETWORK');
    const lockScript = getBtcTimeLockScript(
      network === NetworkType.mainnet,
      BtcTestnetTypeMap[network],
    );
    return lockScript;
  }

  public parseRgbppLockArgs(args: string): { outIndex: number; btcTxid: string } {
    const unpack = RGBPPLock.unpack(args);
    const btcTxid = bytes.hexify(bytes.bytify(unpack.btcTxid).reverse());
    return {
      outIndex: unpack.outIndex,
      btcTxid: remove0x(btcTxid),
    };
  }

  public isRgbppLockScript(script: Script): boolean {
    return isScriptEqual(
      {
        ...script,
        args: '0x',
      },
      this.rgbppLockScript,
    );
  }

  public isBtcTimeLockScript(script: Script): boolean {
    return isScriptEqual(
      {
        ...script,
        args: '0x',
      },
      this.btcTimeLockScript,
    );
  }
}
