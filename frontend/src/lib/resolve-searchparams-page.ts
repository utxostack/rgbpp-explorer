import { redirect } from 'next/navigation'

import { getUrl } from '@/lib/get-url'

export function resolveSearchParamsPage() {
  const url = getUrl()
  const page = Number(url.searchParams.get('page') ?? '1')
  if (isNaN(page)) {
    const params = new URLSearchParams(url.searchParams.toString())
    params.delete('page')
    throw redirect(`${url.pathname}?${params.toString()}`)
  }
  return page
}
