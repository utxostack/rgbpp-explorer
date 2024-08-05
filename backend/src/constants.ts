import * as RgbppBtc from '@rgbpp-sdk/btc';
import { BTCTestnetType } from '@rgbpp-sdk/ckb';

export enum NetworkType {
  mainnet = 'mainnet',
  testnet = 'testnet',
  signet = 'signet',
}

export const BtcNetworkTypeMap: Record<NetworkType, RgbppBtc.NetworkType> = {
  [NetworkType.mainnet]: RgbppBtc.NetworkType.MAINNET,
  [NetworkType.testnet]: RgbppBtc.NetworkType.TESTNET,
  [NetworkType.signet]: RgbppBtc.NetworkType.TESTNET,
};

export const BtcTestnetTypeMap: Record<NetworkType.testnet | NetworkType.signet, BTCTestnetType> = {
  [NetworkType.testnet]: 'Testnet3',
  [NetworkType.signet]: 'Signet',
};

export const CKB_MIN_SAFE_CONFIRMATIONS = 24;
