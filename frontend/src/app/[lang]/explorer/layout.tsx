import { PropsWithChildren } from 'react'
import { Center } from 'styled-system/jsx'

export default function Layout({ children }: PropsWithChildren) {
  return <Center w="100%">{children}</Center>
}
