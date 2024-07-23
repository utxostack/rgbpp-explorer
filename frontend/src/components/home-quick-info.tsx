import { Box, Grid, VStack } from 'styled-system/jsx'

export function HomeQuickInfo() {
  return (
    <Grid
      rounded="200px"
      border="1px solid rgba(255, 255, 255, 0.6)"
      gridTemplateColumns="1fr 1fr"
      p="20px"
      backdropFilter="blur(16.5px)"
      bg="rgba(0, 0, 0, 0.4)"
      w="580px"
    >
      <VStack gap="2px" borderRight="2px solid" borderColor="rgba(255, 255, 255, 0.1)">
        <Box fontSize="36px" lineHeight="100%" fontWeight="bold">
          1000
        </Box>
        <Box fontSize="sm" lineHeight="20px" color="text.third" fontWeight="semibold">
          RGB++ Txns
        </Box>
      </VStack>
      <VStack gap="2px">
        <Box fontSize="36px" lineHeight="100%" fontWeight="bold">
          1000
        </Box>
        <Box fontSize="sm" lineHeight="20px" color="text.third" fontWeight="semibold">
          RGB++ Assets Holders
        </Box>
      </VStack>
    </Grid>
  )
}
