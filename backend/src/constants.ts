import * as RgbppBtc from '@rgbpp-sdk/btc';

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
