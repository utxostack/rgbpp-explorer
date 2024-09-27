import { IntersectionObserver } from '@/components/intersection-observer'
import { Loading } from '@/components/loading'

export interface InfiniteListBottomProps {
  fetchNextPage: () => Promise<unknown>
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
}

export function InfiniteListBottom({ fetchNextPage, hasNextPage, isFetchingNextPage }: InfiniteListBottomProps) {
  return (
    <IntersectionObserver
      w="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      color="text.secondary"
      onChange={(isIntersecting) => {
        if (isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      }}
    >
      {isFetchingNextPage ? <Loading mt="20px" /> : null}
    </IntersectionObserver>
  )
}
