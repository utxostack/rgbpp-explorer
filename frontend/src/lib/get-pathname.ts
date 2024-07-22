import { headers } from 'next/headers'

export function getPathnameFromHeaders() {
  const headersList = headers()
  return headersList.get('x-pathname') ?? ''
}
