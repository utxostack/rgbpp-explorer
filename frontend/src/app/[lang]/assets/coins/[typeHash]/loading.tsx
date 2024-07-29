import { Box } from 'styled-system/jsx'

import { Loading } from '@/components/loading'

export default function LoadingPage() {
  return (
    <Box w="100%" flex={1} textAlign="center">
      <Loading />
    </Box>
  )
}
