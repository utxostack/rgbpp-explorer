import * as bitcoin from 'bitcoinjs-lib'
import * as ecc from 'tiny-secp256k1'

import { env } from '@/constants/env'

export function isValidBTCAddress(address: string) {
  try {
    bitcoin.initEccLib(ecc)
    bitcoin.address.toOutputScript(address, env.public.IS_MAINNET ? bitcoin.networks.bitcoin : bitcoin.networks.testnet)
    return true
  } catch (e) {
    return false
  }
}
