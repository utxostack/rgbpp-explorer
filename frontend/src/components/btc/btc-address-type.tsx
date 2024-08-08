import { Box } from 'styled-system/jsx'

import { getAddressType } from '@/lib/btc/get-btc-address-type'

export function BtcAddressType({ address }: { address: string }) {
  const type = getAddressType(address)
  return type ? (
    <Box bg="bg.input" fontSize="12px" rounded="4px" py="2px" px="4px" color="text.primary">
      {type}
    </Box>
  ) : null
}
