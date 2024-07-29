import { gql, request } from 'graphql-request'

import {
  BlockHeightAndTxns24H,
  BtcAddress,
  BtcBlock,
  BtcTransaction,
  CkbAddress,
  CkbBlock,
  CkbTransaction,
  Pageable,
  RGBppCoin,
  RGBppCoinTransactionList,
  RGBppLatestTransaction,
} from '@/apis/types/explorer-graphql'
import { env } from '@/constants/env'

class ExplorerGraphql {
  protected readonly serverURL = env.share.RGBPP_EXPLORER_API_URL

  constructor() {}

  async getRGBppLatestTransactions() {
    return request<RGBppLatestTransaction.Response>(
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
                  spent
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
    return request<BlockHeightAndTxns24H.Response>(
      this.serverURL,
      gql`
        query {
          ckbChainInfo {
            tipBlockNumber
          }
          btcChainInfo {
            tipBlockHeight
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
    return request<RGBppCoin.Response>(
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
    return request<RGBppCoinTransactionList.Response>(
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
                  spent
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
                  spent
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
                    spent
                    address {
                      address
                      satoshi
                      pendingSatoshi
                      transactionCount
                    }
                  }
                }
                vout {
                  scriptpubkey
                  scriptpubkeyAsm
                  scriptpubkeyType
                  scriptpubkeyAddress
                  value
                  spent
                  address {
                    address
                    satoshi
                    pendingSatoshi
                    transactionCount
                  }
                }
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
              spent
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
                  transactionCount
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
                transactionCount
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
            txCount
            size
            weight
            bits
            difficulty
            totalFee
            miner {
              address
              satoshi
              pendingSatoshi
              transactionCount
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
                spent
                address {
                  address
                  satoshi
                  pendingSatoshi
                  transactionCount
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
                  spent
                  scriptpubkey
                  scriptpubkeyAsm
                  scriptpubkeyType
                  scriptpubkeyAddress
                  value
                  address {
                    address
                    satoshi
                    pendingSatoshi
                    transactionCount
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
              }
              inputs {
                spent
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
            transactionCount
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
            transactionCount
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
                  spent
                  address {
                    address
                    satoshi
                    pendingSatoshi
                    transactionCount
                  }
                }
              }
              vout {
                scriptpubkey
                scriptpubkeyAsm
                scriptpubkeyType
                scriptpubkeyAddress
                value
                spent
                address {
                  address
                  satoshi
                  pendingSatoshi
                  transactionCount
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
                spent
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

  async search(keyword: string) {}
}

export const explorerGraphql = new ExplorerGraphql()
