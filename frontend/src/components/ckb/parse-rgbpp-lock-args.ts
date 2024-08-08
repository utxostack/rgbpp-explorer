import { bytes } from '@ckb-lumos/lumos/codec'
import { remove0x, RGBPPLock } from '@rgbpp-sdk/ckb'

export function parseRgbppLockArgs(args: string): { outIndex: number; btcTxid: string } {
  const unpack = RGBPPLock.unpack(args)
  const btcTxid = bytes.hexify(bytes.bytify(unpack.btcTxid).reverse())
  return {
    outIndex: unpack.outIndex,
    btcTxid: remove0x(btcTxid),
  }
}
