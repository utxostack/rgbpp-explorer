import { Box, Center } from 'styled-system/jsx'

import LoadingSpritePng from '@/assets/loading-sprite.png'
import { Image } from '@/components/ui/image'

export function Loading() {
  return (
    <Center>
      <Box pos="relative" w="80px" h="80px" overflow="hidden">
        <Image
          minW="1752px"
          h="100%"
          pos="absolute"
          top="0"
          left="0"
          animation="steps-x 500ms steps(21) infinite"
          // className={css({
          //   '--steps-offset-x': '1609px',
          // })}
          style={
            {
              '--steps-offset-x': '-1752px',
            } as any
          }
          alt="loading"
          src={LoadingSpritePng.src}
          width={LoadingSpritePng.width}
          height={LoadingSpritePng.height}
        />
      </Box>
    </Center>
  )
}
