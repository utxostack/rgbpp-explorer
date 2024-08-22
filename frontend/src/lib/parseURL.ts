export function parseURL(str: string): URL | null {
  try {
    return new URL(str)
  } catch {
    return null
  }
}
