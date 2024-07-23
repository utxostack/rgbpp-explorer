export function iife<T>(callback: () => T): T {
  return callback()
}
