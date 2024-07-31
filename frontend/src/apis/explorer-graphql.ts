import { gql, request } from 'graphql-request'

import {
  BtcAddress,
  BtcBlock,
  BtcChainInfo,
  BtcTransaction,
  CkbAddress,
  CkbBlock,
  CkbChainInfo,
  CkbTransaction,
  Pageable,
  RGBppCoin,
  RgbppStatistic,
  RGBppTransaction,
  SearchResult,
} from '@/apis/types/explorer-graphql'
import { env } from '@/constants/env'

class ExplorerGraphql {
  protected readonly serverURL = env.share.RGBPP_EXPLORER_API_URL

  constructor() {}

  async getRGBppLatestTransactions() {
    return request<{
      rgbppLatestTransactions: {
        txs: RGBppTransaction[]
        total: number
        pageSize: number
      }
    }>(
      this.serverURL,
      gql`
        query RgbppLatestTransactions {
          rgbppLatestTransactions(page: 1, pageSize: 10) {
            txs {
              ckbTxHash
              btcTxid
              leapDirection
              blockNumber
              timestamp
              ckbTransaction {
                blockNumber
                hash
                fee
                size
                inputs {
                  status {
                    consumed
                    txHash
                    index
                  }
                  txHash
                  index
                  capacity
                  lock {
                    codeHash
                    hashType
                    args
                  }
                  xudtInfo {
                    symbol
                    amount
                    decimal
                  }
                }
                outputs {
                  txHash
                  index
                  capacity
                  lock {
                    codeHash
                    hashType
                    args
                  }
                  xudtInfo {
                    symbol
                    amount
                    decimal
                  }
                  status {
                    consumed
                    txHash
                    index
                  }
                }
              }
              btcTransaction {
                blockHeight
                blockHash
                txid
                version
                size
                locktime
                weight
                fee
                confirmed
              }
            }
            total
            pageSize
          }
        }
      `,
    )
  }

  async getBlockHeightAndTxns24H() {
    return request<{
      ckbChainInfo: Pick<CkbChainInfo, 'tipBlockNumber'>
      btcChainInfo: BtcChainInfo
    }>(
      this.serverURL,
      gql`
        query {
          ckbChainInfo {
            tipBlockNumber
          }
          btcChainInfo {
            tipBlockHeight
            transactionsCountIn24Hours
          }
        }
      `,
    )
  }

  async getRGBppCoins({ page = 1, pageSize = 10 }: Pageable = {}) {
    return request<{
      rgbppCoins: {
        total: number
        pageSize: number
        coins: RGBppCoin[]
      }
    }>(
      this.serverURL,
      gql`
        query RgbppCoins {
          rgbppCoins(page: ${page}, pageSize: ${pageSize}) {
            total
            pageSize
            coins {
              name
              symbol
              holdersCount
              h24CkbTransactionsCount
              totalAmount
              deployedAt
              decimal
              typeHash
            }
          }
        }
      `,
    )
  }

  async getRGBppCoin(typeHash: string) {
    return request<{
      rgbppCoin: RGBppCoin
    }>(
      this.serverURL,
      gql`
        query RgbppCoin {
          rgbppCoin(typeHash: "${typeHash}") {
            name
            description
            symbol
            decimal
            icon
            typeHash
            holdersCount
            h24CkbTransactionsCount
            totalAmount
            issuer
            deployedAt
            typeScript {
              codeHash
              hashType
              args
            }
          }
        }
      `,
    )
  }

  async getRGBppCoinTransactions(typeHash: string, { page = 1, pageSize = 10 }: Pageable = {}) {
    return request<{
      rgbppCoin: {
        transactions: RGBppTransaction[]
      }
    }>(
      this.serverURL,
      gql`
        query RgbppCoin {
          rgbppCoin(
            typeHash: "${typeHash}"
          ) {
            transactions(page: ${page}, pageSize: ${pageSize}) {
              ckbTxHash
              btcTxid
              leapDirection
              blockNumber
              timestamp
              ckbTransaction {
                isCellbase
                blockNumber
                hash
                fee
                feeRate
                size
                confirmations
                inputs {
                  txHash
                  index
                  capacity
                  status {
                    consumed
                    txHash
                    index
                  }
                  type {
                    codeHash
                    hashType
                    args
                  }
                  lock {
                    codeHash
                    hashType
                    args
                  }
                  xudtInfo {
                    symbol
                    amount
                    decimal
                    typeHash
                  }
                }
                outputs {
                  txHash
                  index
                  capacity
                  status {
                    consumed
                    txHash
                    index
                  }
                  type {
                    codeHash
                    hashType
                    args
                  }
                  lock {
                    codeHash
                    hashType
                    args
                  }
                  xudtInfo {
                    symbol
                    amount
                    decimal
                    typeHash
                  }
                }
              }
              btcTransaction {
                blockHeight
                blockHash
                txid
                version
                size
                locktime
                weight
                fee
                feeRate
                confirmed
                confirmations
                vin {
                  txid
                  vout
                  scriptsig
                  scriptsigAsm
                  isCoinbase
                  sequence
                  prevout {
                    scriptpubkey
                    scriptpubkeyAsm
                    scriptpubkeyType
                    scriptpubkeyAddress
                    value
                    status {
                      spent
                      txid
                      vin
                    }
                    address {
                      address
                      satoshi
                      pendingSatoshi
                      transactionsCount
                    }
                  }
                }
                vout {
                  scriptpubkey
                  scriptpubkeyAsm
                  scriptpubkeyType
                  scriptpubkeyAddress
                  value
                  status {
                    spent
                    txid
                    vin
                  }
                  address {
                    address
                    satoshi
                    pendingSatoshi
                    transactionsCount
                  }
                }
              }
            }
          }
        }

      `,
    )
  }

  async getTransaction(txidOrTxHash: string) {
    return request<{ rgbppTransaction: RGBppTransaction }>(
      this.serverURL,
      gql`
      query RgbppTransaction {
        rgbppTransaction(txidOrTxHash: "${txidOrTxHash}") {
          ckbTxHash
          btcTxid
          leapDirection
          blockNumber
          timestamp
          btcTransaction {
            blockHeight
            blockHash
            txid
            version
            size
            locktime
            weight
            fee
            feeRate
            confirmed
            confirmations
            vin {
              txid
              vout
              scriptsig
              scriptsigAsm
              isCoinbase
              sequence
              prevout {
                txid
                vout
                scriptpubkey
                scriptpubkeyAsm
                scriptpubkeyType
                scriptpubkeyAddress
                value
                address {
                  address
                  satoshi
                  pendingSatoshi
                  transactionsCount
                }
                status {
                  spent
                  txid
                  vin
                }
              }
            }
            vout {
              txid
              vout
              scriptpubkey
              scriptpubkeyAsm
              scriptpubkeyType
              scriptpubkeyAddress
              value
              address {
                address
                satoshi
                pendingSatoshi
                transactionsCount
              }
              status {
                spent
                txid
                vin
              }
            }
          }
          ckbTransaction {
            isCellbase
            blockNumber
            hash
            fee
            feeRate
            size
            confirmed
            confirmations
            outputs {
              txHash
              index
              capacity
              type {
                codeHash
                hashType
                args
              }
              lock {
                codeHash
                hashType
                args
              }
              status {
                consumed
                txHash
                index
              }
              xudtInfo {
                symbol
                amount
                decimal
                typeHash
              }
            }
            inputs {
              txHash
              index
              capacity
              type {
                codeHash
                hashType
                args
              }
              lock {
                codeHash
                hashType
                args
              }
              xudtInfo {
                symbol
                amount
                decimal
                typeHash
              }
              status {
                consumed
                txHash
                index
              }
            }
            block {
              timestamp
            }
          }
        }
      }
    `,
    )
  }

  async getCkbTransaction(txHash: string) {
    return request<{ ckbTransaction: CkbTransaction }>(
      this.serverURL,
      gql`
        query CkbTransaction {
          ckbTransaction(txHash: "${txHash}") {
            isCellbase
            blockNumber
            hash
            fee
            size
            feeRate
            confirmations
            inputs {
              status {
                consumed
                txHash
                index
              }
              txHash
              index
              capacity
              type {
                codeHash
                hashType
                args
              }
              lock {
                codeHash
                hashType
                args
              }
              xudtInfo {
                symbol
                amount
                decimal
                typeHash
              }
            }
            outputs {
              txHash
              index
              capacity
              type {
                codeHash
                hashType
                args
              }
              lock {
                codeHash
                hashType
                args
              }
              xudtInfo {
                symbol
                amount
                decimal
                typeHash
              }
              status {
                consumed
                txHash
                index
              }
            }
            block {
              timestamp
              number
            }
          }
        }
      `,
    )
  }

  async getBtcTransaction(txid: string) {
    return request<{ btcTransaction: BtcTransaction }>(
      this.serverURL,
      gql`
        query BtcTransaction {
          btcTransaction(txid: "${txid}") {
            blockHeight
            blockHash
            txid
            version
            vin {
              txid
              vout
              scriptsig
              scriptsigAsm
              isCoinbase
              sequence
              prevout {
                scriptpubkey
                scriptpubkeyAsm
                scriptpubkeyType
                scriptpubkeyAddress
                value
                address {
                  address
                  satoshi
                  pendingSatoshi
                  transactionsCount
                }
              }
            }
            vout {
              scriptpubkey
              scriptpubkeyAsm
              scriptpubkeyType
              scriptpubkeyAddress
              value
              address {
                address
                satoshi
                pendingSatoshi
                transactionsCount
              }
            }
            size
            locktime
            weight
            fee
            feeRate
            confirmed
            confirmations
          }
        }
      `,
    )
  }

  async getBtcBlock(hashOrHeight: string) {
    return request<{ btcBlock: BtcBlock }>(
      this.serverURL,
      gql`
        query BtcBlock {
          btcBlock(hashOrHeight: "${hashOrHeight}") {
            id
            height
            version
            timestamp
            transactionsCount
            size
            weight
            bits
            difficulty
            totalFee
            miner {
              address
              satoshi
              pendingSatoshi
              transactionsCount
            }
            feeRateRange {
              min
              max
            }
          }
        }
      `,
    )
  }

  async getBtcBlockTransaction(hashOrHeight: string) {
    return request<{
      btcBlock: {
        transactions: BtcTransaction[]
      }
    }>(
      this.serverURL,
      gql`
        query BtcBlock {
          btcBlock(hashOrHeight: "${hashOrHeight}") {
            transactions {
              blockHeight
              blockHash
              txid
              version
              size
              locktime
              weight
              fee
              confirmed
              vout {
                scriptpubkey
                scriptpubkeyAsm
                scriptpubkeyType
                scriptpubkeyAddress
                value
                status {
                  spent
                  txid
                  vin
                }
                address {
                  address
                  satoshi
                  pendingSatoshi
                  transactionsCount
                }
              }
              vin {
                txid
                vout
                scriptsig
                scriptsigAsm
                isCoinbase
                sequence
                prevout {
                  status {
                    spent
                    txid
                    vin
                  }
                  scriptpubkey
                  scriptpubkeyAsm
                  scriptpubkeyType
                  scriptpubkeyAddress
                  value
                  address {
                    address
                    satoshi
                    pendingSatoshi
                    transactionsCount
                  }
                }
              }
            }
          }
        }

      `,
    )
  }

  getCkbBlock(hashOrHeight: string) {
    return request<{ ckbBlock: CkbBlock }>(
      this.serverURL,
      gql`
        query CkbBlock {
          ckbBlock(heightOrHash: "${hashOrHeight}") {
            version
            hash
            number
            timestamp
            transactionsCount
            totalFee
          }
        }
      `,
    )
  }

  getCkbBlockTransaction(hashOrHeight: string) {
    return request<{ ckbBlock: { transactions: CkbTransaction[] } }>(
      this.serverURL,
      gql`
        query CkbBlock {
          ckbBlock(heightOrHash: "${hashOrHeight}") {
            transactions {
              isCellbase
              blockNumber
              hash
              fee
              size
              feeRate
              confirmations
              outputs {
                txHash
                index
                capacity
                lock {
                  codeHash
                  hashType
                  args
                }
                type {
                  codeHash
                  hashType
                  args
                }
                xudtInfo {
                  symbol
                  amount
                  decimal
                  typeHash
                }
                status {
                  consumed
                  txHash
                  index
                }
              }
              inputs {
                status {
                  consumed
                  txHash
                  index
                }
                txHash
                index
                capacity
                lock {
                  codeHash
                  hashType
                  args
                }
                type {
                  codeHash
                  hashType
                  args
                }
                xudtInfo {
                  symbol
                  amount
                  decimal
                  typeHash
                }
              }
            }
          }
        }

      `,
    )
  }

  getBtcAddress(address: string) {
    return request<{ btcAddress: BtcAddress | null }>(
      this.serverURL,
      gql`
        query BtcAddress {
          btcAddress(address: "${address}") {
            address
            satoshi
            pendingSatoshi
            transactionsCount
          }
        }
      `,
    )
  }

  getCkbAddress(address: string) {
    return request<{ ckbAddress: CkbAddress | null }>(
      this.serverURL,
      gql`
        query CkbAddress {
          ckbAddress(address: "${address}") {
            address
            shannon
            transactionsCount
          }
        }
      `,
    )
  }

  getBtcTransactionsByAddress(address: string) {
    return request<{ btcAddress: { transactions: BtcTransaction[] } | null }>(
      this.serverURL,
      gql`
        query BtcAddress {
          btcAddress(address: "${address}") {
            transactions {
              blockHeight
              blockHash
              txid
              version
              size
              locktime
              weight
              fee
              feeRate
              confirmed
              confirmations
              vin {
                txid
                vout
                scriptsig
                scriptsigAsm
                isCoinbase
                sequence
                prevout {
                  scriptpubkey
                  scriptpubkeyAsm
                  scriptpubkeyType
                  scriptpubkeyAddress
                  value
                  status {
                    spent
                    txid
                    vin
                  }
                  address {
                    address
                    satoshi
                    pendingSatoshi
                    transactionsCount
                  }
                }
              }
              vout {
                scriptpubkey
                scriptpubkeyAsm
                scriptpubkeyType
                scriptpubkeyAddress
                value
                status {
                  spent
                  txid
                  vin
                }
                address {
                  address
                  satoshi
                  pendingSatoshi
                  transactionsCount
                }
              }
            }
          }
        }
      `,
    )
  }

  async getCkbTransactionByAddress(address: string, { page = 1, pageSize = 10 }: Pageable = {}) {
    return request<{ ckbAddress: { transactions: CkbTransaction[] } }>(
      this.serverURL,
      gql`
        query CkbAddress {
          ckbAddress (address: "${address}") {
            transactions(page: ${page}, pageSize: ${pageSize}) {
              isCellbase
              blockNumber
              hash
              fee
              size
              feeRate
              confirmations
              inputs {
                status {
                  consumed
                  txHash
                  index
                }
                txHash
                index
                capacity
                type {
                  codeHash
                  hashType
                  args
                }
                lock {
                  codeHash
                  hashType
                  args
                }
                xudtInfo {
                  symbol
                  amount
                  decimal
                  typeHash
                }
              }
              outputs {
                txHash
                index
                capacity
                type {
                  codeHash
                  hashType
                  args
                }
                lock {
                  codeHash
                  hashType
                  args
                }
                xudtInfo {
                  symbol
                  amount
                  decimal
                  typeHash
                }
                status {
                  consumed
                  txHash
                  index
                }
              }
              block {
                timestamp
                number
              }
            }
          }
        }
      `,
    )
  }

  async search(keyword: string) {
    return request<SearchResult>(
      this.serverURL,
      gql`
        query Search {
          search(query: "${keyword}") {
            query
            btcBlock
            btcTransaction
            btcAddress
            ckbBlock
            ckbTransaction
            ckbAddress
            rgbppCoin
          }
        }
      `,
    )
  }

  getRGBppStatistic() {
    return request<{ rgbppStatistic: RgbppStatistic }>(
      this.serverURL,
      gql`
        query RgbppStatistic {
          rgbppStatistic {
            transactionsCount
            holdersCount
          }
        }
      `,
    )
  }

  getBtcChainInfo() {
    return request<{ btcChainInfo: BtcChainInfo; rgbppStatistic: Pick<RgbppStatistic, 'holdersCount'> }>(
      this.serverURL,
      gql`
        query BtcChainInfo {
          btcChainInfo {
            tipBlockHeight
            tipBlockHash
            difficulty
            transactionsCountIn24Hours
            fees {
              fastest
              halfHour
              hour
              economy
              minimum
            }
          }
          rgbppStatistic {
            holdersCount
          }
        }
      `,
    )
  }

  getCkbChainInfo() {
    return request<{ ckbChainInfo: CkbChainInfo; rgbppStatistic: Pick<RgbppStatistic, 'holdersCount'> }>(
      this.serverURL,
      gql`
        query CkbChainInfo {
          ckbChainInfo {
            tipBlockNumber
            transactionsCountIn24Hours
            fees {
              fast
              slow
              average
            }
          }
          rgbppStatistic {
            holdersCount
          }
        }
      `,
    )
  }
}

export const explorerGraphql = new ExplorerGraphql()
