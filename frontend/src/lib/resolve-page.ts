import { notFound } from 'next/navigation'

export function resolvePage(str?: string) {
  const parsedInt = parseInt(str ?? '1', 10)
  if (isNaN(parsedInt) || parsedInt <= 0) {
    notFound()
  }
  return parsedInt
}
