import { BI } from "@ckb-lumos/bi";

// https://github.com/nervosnetwork/ckb-explorer/blob/d2baaf25b2dddd815366cf34df4e77841ee43e99/app/utils/ckb_utils.rb#L328
function compactToTarget(compact: bigint): [bigint, boolean] {
  const exponent = compact >> 24n;
  const mantissa = compact & 0x00ffffffn;

  let ret: bigint = 0n;
  if (exponent <= 3n) {
    ret = mantissa >> (8n * (3n - exponent));
  } else {
    ret = mantissa;
    ret <<= 8n * (exponent - 3n);
  }
  const overflow = mantissa !== 0n && exponent > 32n;

  return [ret, overflow];
}

// https://github.com/nervosnetwork/ckb-explorer/blob/d2baaf25b2dddd815366cf34df4e77841ee43e99/app/utils/ckb_utils.rb#L344
function targetToDifficulty(target: bigint): BI {
  const bTarget = BI.from(target);
  const U256_MAX_VALUE = BI.from(2).pow(256).sub(1);
  const HSPACE = BI.from('0x10000000000000000000000000000000000000000000000000000000000000000');

  if (bTarget.isZero()) {
    return U256_MAX_VALUE;
  } else {
    return HSPACE.div(bTarget);
  }
}

// https://github.com/nervosnetwork/ckb-explorer/blob/d2baaf25b2dddd815366cf34df4e77841ee43e99/app/utils/ckb_utils.rb#L315
export function compactToDifficulty(compact: string): BI {
  const [target, overflow] = compactToTarget(BI.from(compact).toBigInt());
  if (target === 0n || overflow) {
    return BI.from(0);
  }
  return targetToDifficulty(target);
}
