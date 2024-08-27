'use client'

import { forwardRef } from 'react'

import ChevronLeftIcon from '@/assets/chevron-left.svg'
import ChevronRightIcon from '@/assets/chevron-right.svg'
import { Button, IconButton, Pagination as ArkPagination } from '@/components/ui/primitives'

export interface PaginationProps extends ArkPagination.RootProps {}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(props, ref) {
  return (
    <ArkPagination.Root ref={ref} {...props}>
      <ArkPagination.PrevTrigger asChild>
        <IconButton variant="ghost" aria-label="Next Page" w="32px" h="32px" minW="unset">
          <ChevronLeftIcon />
        </IconButton>
      </ArkPagination.PrevTrigger>
      <ArkPagination.Context>
        {(pagination) =>
          pagination.pages.map((page, index) =>
            page.type === 'page' ? (
              <ArkPagination.Item key={index} {...page} asChild>
                <Button
                  variant={pagination.page === page.value ? 'solid' : 'ghost'}
                  w="32px"
                  h="32px"
                  fontSize="14px"
                  minW="unset"
                >
                  {page.value}
                </Button>
              </ArkPagination.Item>
            ) : (
              <ArkPagination.Ellipsis key={index} index={index} fontSize="14px">
                &#8230;
              </ArkPagination.Ellipsis>
            ),
          )
        }
      </ArkPagination.Context>
      <ArkPagination.NextTrigger asChild>
        <IconButton variant="ghost" aria-label="Next Page" w="32px" h="32px" minW="unset">
          <ChevronRightIcon />
        </IconButton>
      </ArkPagination.NextTrigger>
    </ArkPagination.Root>
  )
})
