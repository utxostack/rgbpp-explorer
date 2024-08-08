import * as bitcoin from 'bitcoinjs-lib'

import { env } from '@/constants/env'

type AddressType = 'P2PKH' | 'P2SH' | 'P2WPKH' | 'P2SH-P2WPKH' | 'P2TR'

export function getAddressType(address: string): AddressType | null {
  try {
    const network = env.public.IS_MAINNET ? bitcoin.networks.bitcoin : bitcoin.networks.testnet
    try {
      const bech32Decoded = bitcoin.address.fromBech32(address)
      const prefix = bech32Decoded.prefix
      const version = bech32Decoded.version

      if (prefix === (network === bitcoin.networks.testnet ? 'tb' : 'bc')) {
        if (version === 0) return 'P2WPKH'
        if (version === 1) return 'P2TR'
      }
    } catch {}

    const base58Decoded = bitcoin.address.fromBase58Check(address)
    const version = base58Decoded.version

    if (network === bitcoin.networks.testnet) {
      if (version === 0x6f) return 'P2PKH'
      if (version === 0xc4) return 'P2SH-P2WPKH'
      if (version === 0xc4) return 'P2SH'
    } else {
      if (version === 0x00) return 'P2PKH'
      if (version === 0x05) return 'P2SH-P2WPKH'
      if (version === 0x05) return 'P2SH'
    }
  } catch {}

  return null
}
