import ecc from '@bitcoinerlab/secp256k1'
import * as bitcoin from 'bitcoinjs-lib'

import { env } from '@/constants/env'

bitcoin.initEccLib(ecc)

export function isValidBTCAddress(address: string) {
  try {
    bitcoin.address.toOutputScript(address, env.public.IS_MAINNET ? bitcoin.networks.bitcoin : bitcoin.networks.testnet)
    return true
  } catch (e) {
    return false
  }
}
