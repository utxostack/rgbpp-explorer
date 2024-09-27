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
import { BtcTestnetTypeMap, NetworkType } from 'src/constants';
import { Env } from 'src/env';
import { Transaction } from './blockchain/blockchain.interface';
import { BlockchainServiceFactory } from './blockchain/blockchain.factory';
import { LeapDirection } from '@prisma/client';
import { ONE_MONTH_MS } from 'src/common/date';
import { Cacheable } from 'src/decorators/cacheable.decorator';

export const CELLBASE_TX_HASH =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

@Injectable()
export class CoreService {
  constructor(
    private configService: ConfigService<Env>,
    private blockchainServiceFactory: BlockchainServiceFactory,
  ) {}

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

  @Cacheable({
    namespace: 'CoreService',
    key: (chainId: number, ckbTx: Transaction) => {
      return `getLeapDirectionByCkbTx:${chainId}:${ckbTx.hash}`;
    },
    ttl: ONE_MONTH_MS,
  })
  public async getLeapDirectionByCkbTx(chainId: number, ckbTx: Transaction) {
    const blockchainService = this.blockchainServiceFactory.getService(chainId);
    const inputCells = await Promise.all(
      ckbTx.inputs.map(async (input) => {
        const inputTx = await blockchainService.getTransaction(input.previous_output.tx_hash);
        const index = BI.from(input.previous_output.index).toNumber();
        return inputTx?.transaction.outputs?.[index] ?? null;
      }),
    );
    const hasRgbppLockInput = inputCells.some(
      (cell) =>
        cell?.lock &&
        this.isRgbppLockScript({
          codeHash: cell.lock.code_hash,
          hashType: cell.lock.hash_type as HashType,
          args: cell.lock.args,
        }),
    );
    const hasRgbppLockOuput = ckbTx.outputs.some(
      (output) =>
        output?.lock &&
        this.isRgbppLockScript({
          codeHash: output.lock.code_hash,
          hashType: output.lock.hash_type as HashType,
          args: output.lock.args,
        }),
    );
    const hasBtcTimeLockOutput = ckbTx.outputs.some(
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
