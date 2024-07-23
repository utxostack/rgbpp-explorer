'use client'

import { redirect, usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Pagination, type PaginationProps } from '@/components/ui'

// TODO: recode RSC by Link
export function PaginationSearchParams(props: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = Number(searchParams.get('page') ?? '1')
  const pathname = usePathname()

  if (isNaN(page)) {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    throw redirect(`${pathname}?${params.toString()}`)
  }

  return (
    <Pagination
      {...props}
      siblingCount={1}
      page={page}
      onPageChange={(details) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', `${details.page}`)
        router.replace(`${pathname}?${params.toString()}`)
      }}
    />
  )
}
