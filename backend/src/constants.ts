import * as RgbppBtc from '@rgbpp-sdk/btc';
import { BTCTestnetType, getClusterTypeScript, getSporeTypeScript } from '@rgbpp-sdk/ckb';

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

export const XUDT_TYPESCRIPTS = {
  [NetworkType.mainnet]: [
    // https://explorer.nervos.org/scripts#xUDT
    {
      codeHash: '0x50bd8d6680b8b9cf98b73f3c08faf8b2a21914311954118ad6609be6e78a1b95',
      hashType: 'data1',
      args: '0x',
    },
  ],
  [NetworkType.testnet]: [
    // https://pudge.explorer.nervos.org/scripts#xUDT(final_rls)
    {
      codeHash: '0x25c29dc317811a6f6f3985a7a9ebc4838bd388d19d0feeecf0bcd60f6c0975bb',
      hashType: 'type',
      args: '0x',
    },
    // https://pudge.explorer.nervos.org/scripts#xUDT
    {
      codeHash: '0x50bd8d6680b8b9cf98b73f3c08faf8b2a21914311954118ad6609be6e78a1b95',
      hashType: 'data1',
      args: '0x',
    },
  ],
};

export const SUDT_TYPESCRIPTS = {
  [NetworkType.mainnet]: [
    // https://explorer.nervos.org/scripts#sudt
    {
      codeHash: '0x5e7a36a77e68eecc013dfa2fe6a23f3b6c344b04005808694ae6dd45eea4cfd5',
      hashType: 'type',
      args: '0x',
    },
  ],
  [NetworkType.testnet]: [
    // https://pudge.explorer.nervos.org/scripts#sudt
    {
      codeHash: '0xc5e5dcf215925f7ef4dfaf5f4b4f105bc321c02776d6e7d52a1db3fcd9d011a4',
      hashType: 'type',
      args: '0x',
    },
  ],
};

export const DOB_TYPESCRIPTS = {
  [NetworkType.mainnet]: [
    {
      ...getSporeTypeScript(true),
      args: '0x',
    },
    {
      ...getClusterTypeScript(true),
      args: '0x',
    },
  ],
  [NetworkType.testnet]: [
    {
      ...getSporeTypeScript(false),
      args: '0x',
    },
    {
      ...getClusterTypeScript(false),
      args: '0x',
    },
  ],
};

export const MNFT_TYPESCRIPTS = {
  [NetworkType.mainnet]: [
    {
      codeHash: '0x2b24f0d644ccbdd77bbf86b27c8cca02efa0ad051e447c212636d9ee7acaaec9',
      hashType: 'type',
      args: '0x',
    },
  ],
  [NetworkType.testnet]: [
    {
      codeHash: '0xb1837b5ad01a88558731953062d1f5cb547adf89ece01e8934a9f0aeed2d959f',
      hashType: 'type',
      args: '0x',
    },
  ],
};
