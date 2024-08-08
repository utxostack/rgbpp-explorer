export function resolveBtcTime(sTimestamp: number) {
  return Number(sTimestamp.toString().padEnd(13, '0'))
}
