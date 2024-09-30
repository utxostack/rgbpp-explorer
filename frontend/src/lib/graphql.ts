import { GraphQLClient } from 'graphql-request'

import { env } from '@/constants/env'

export const graphQLClient = new GraphQLClient(env.share.RGBPP_EXPLORER_API_URL, {
  fetch(input, init) {
    return fetch(input, {
      ...init,
    })
  },
})
