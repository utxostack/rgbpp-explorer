import { BI, HashType, Script } from '@ckb-lumos/lumos';
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
import * as BlockchainInterface from '../blockchain/blockchain.interface';
import { BtcTestnetTypeMap, NetworkType } from 'src/constants';
import pLimit from 'p-limit';
import { Env } from 'src/env';

const limit = pLimit(100);

export enum LeapDirection {
  LeapIn = 'leap_in',
  LeapOut = 'leap_out',
  Within = 'within',
}

export const CELLBASE_TX_HASH =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

@Injectable()
export class RgbppCoreService {
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

  public async getRgbppTxLeapDirection(
    tx: BlockchainInterface.Transaction,
    fetchTx: (txid: string) => Promise<BlockchainInterface.Transaction>,
  ): Promise<LeapDirection | null> {
    const inputTxhashes = Array.from(
      new Set(tx.inputs.map((input) => input.previous_output.tx_hash)),
    );
    const inputTxs = await Promise.all(inputTxhashes.map((txid) => limit(() => fetchTx(txid))));
    const inputTxsMap = new Map(inputTxs.map((tx) => [tx.hash, tx]));

    const inputCells = tx.inputs.map((input) => {
      const inputTx = inputTxsMap.get(input.previous_output.tx_hash);
      const index = BI.from(input.previous_output.index).toNumber();
      return inputTx!.outputs?.[index] ?? null;
    });
    const hasRgbppLockInput = inputCells.some(
      (cell) =>
        cell?.lock &&
        this.isRgbppLockScript({
          codeHash: cell.lock.code_hash,
          hashType: cell.lock.hash_type as HashType,
          args: cell.lock.args,
        }),
    );
    const hasRgbppLockOuput = tx.outputs.some(
      (output) =>
        output?.lock &&
        this.isRgbppLockScript({
          codeHash: output.lock.code_hash,
          hashType: output.lock.hash_type as HashType,
          args: output.lock.args,
        }),
    );
    const hasBtcTimeLockOutput = tx.outputs.some(
      (output) =>
        output.lock &&
        this.isBtcTimeLockScript({
          codeHash: output.lock.code_hash,
          hashType: output.lock.hash_type as HashType,
          args: output.lock.args,
        }),
    );
    if (hasRgbppLockInput && hasBtcTimeLockOutput) {
      return LeapDirection.LeapOut;
    }
    if (hasRgbppLockInput && hasRgbppLockOuput) {
      return LeapDirection.Within;
    }
    if (!hasRgbppLockInput && hasRgbppLockOuput) {
      return LeapDirection.LeapIn;
    }
    return null;
  }
}
