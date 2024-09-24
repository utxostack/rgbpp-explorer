'use client'

import { Trans } from '@lingui/macro'
import { redirect, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui'
import Link from '@/components/ui/link'
import { NumberInput } from '@/components/ui/number-input'

export function PaginationSearchParams(props: { count: number; pageSize: number }) {
  const { count, pageSize } = props
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialPage = Number(searchParams.get('page') ?? '1')
  const pathname = usePathname()

  if (isNaN(initialPage)) {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    redirect(`${pathname}?${params.toString()}`)
  }

  const [page, setPage] = useState(initialPage)

  return (
    <>
      <NumberInput
        value={`${page}`}
        onValueChange={(e) => setPage(e.valueAsNumber)}
        min={0}
        max={Math.ceil(count / pageSize)}
        w="150px"
      />
      <Link
        href={{
          pathname,
          query: {
            page,
          },
        }}
      >
        <Button>
          <Trans>Go</Trans>
        </Button>
      </Link>
    </>
  )
}
