import { headers } from 'next/headers'

export function getUrl() {
  const headersList = headers()
  return new URL(headersList.get('x-url')!)
}
