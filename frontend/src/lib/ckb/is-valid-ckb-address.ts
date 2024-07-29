import { parseAddress } from '@nervosnetwork/ckb-sdk-utils'

export function isValidCkbAddress(address: string) {
  try {
    parseAddress(address)
    return true
  } catch {
    return false
  }
}
