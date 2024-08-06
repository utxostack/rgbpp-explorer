import { graphql } from '@/gql'

graphql(`
  query BtcAndCkbChainInfo {
    ckbChainInfo {
      tipBlockNumber
    }
    btcChainInfo {
      tipBlockHeight
      transactionsCountIn24Hours
    }
  }
`)
