import { redirect } from 'next/navigation'

import { getUrl } from '@/lib/get-url'

export function resolveSearchParamsPage() {
  const url = getUrl()
  const page = parseInt(url.searchParams.get('page') ?? '1', 10)
  if (isNaN(page) || page <= 0) {
    const params = new URLSearchParams(url.searchParams.toString())
    params.delete('page')
    throw redirect(`${url.pathname}?${params.toString()}`)
  }
  return page
}
