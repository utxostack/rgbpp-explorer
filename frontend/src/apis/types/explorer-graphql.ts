export enum LeapDirection {
  Out = 'LeapOut',
  In = 'LeapIn',
  Within = 'Within',
}

export interface XudtInfo {
  symbol: string
  amount: number
  decimal: number
  typeHash: string
}

export interface CkbChainInfo {
  tipBlockNumber: number
}

export interface BtcChainInfo {
  tipBlockHeight: number
}

export interface Pageable {
  page?: number
  pageSize?: number
}

export interface TypeScript {
  codeHash: string
  hashType: string
  args: string
}

export interface RGBppCoin {
  name: string
  description?: any
  symbol: string
  decimal: number
  icon?: any
  typeHash: string
  holdersCount: number
  h24CkbTransactionsCount: number
  totalAmount: number
  issuer: string
  deployedAt: string | number | null
  typeScript: TypeScript
}

export interface RGBppTransaction {
  ckbTxHash: string
  btcTxid: string
  leapDirection: LeapDirection | null
  blockNumber: number
  timestamp: number
  ckbTransaction?: CkbTransaction
  btcTransaction?: BtcTransaction
}

export type CkbScript = CKBComponents.Script

export interface CkbCell {
  capacity: number
  lock: CkbScript
  xudtInfo: Pick<XudtInfo, 'amount' | 'decimal' | 'symbol'>
  spent: boolean
}

export interface BtcTransaction {
  blockHeight: number
  blockHash: string
  txid: string
  version: number
  vin: Vin[]
  vout: Vout[]
  size: number
  locktime: number
  weight: number
  fee: number
  feeRate: number
  confirmed: boolean
  confirmations: number
}

export interface BtcAddress {
  address: string
  satoshi: number
  pendingSatoshi: number
  transactionCount: number
}

export interface CkbAddress {
  address: string
  shannon: number
  transactionCount: number
}

export enum ScriptpubkeyType {
  OpReturn = 'op_return',
  P2wpkh = 'v0_p2wpkh',
}

export type Vout = (
  | {
      scriptpubkeyType: ScriptpubkeyType.OpReturn
      address: null
    }
  | {
      scriptpubkeyType: ScriptpubkeyType.P2wpkh
      address: BtcAddress
    }
) & {
  scriptpubkey: string
  scriptpubkeyAsm: string
  scriptpubkeyAddress?: string
  value: number
  spent: boolean
}

export interface Prevout {
  scriptpubkey: string
  scriptpubkeyAsm: string
  scriptpubkeyType: string
  scriptpubkeyAddress: string
  value: number
  address: BtcAddress
  spent: boolean
}

export interface Vin {
  txid: string
  vout: number
  scriptsig: string
  scriptsigAsm: string
  isCoinbase: boolean
  sequence: number
  prevout: Prevout | null
}

export interface CkbTransaction {
  isCellbase: boolean
  hash: string
  fee: number
  size: number
  feeRate: number
  blockNumber: number
  inputs: CkbCell[]
  outputs: CkbCell[]
  block?: CkbBlock
  confirmations: number
}

export interface CkbBlock {
  version: number
  hash: string
  number: number
  timestamp: number
  transactionsCount: number
  totalFee: number
}

export interface BtcBlock {
  id: string
  height: number
  version: number
  timestamp: number
  txCount: number
  size: number
  weight: number
  bits: number
  difficulty: number
  totalFee: number
  miner: Miner
  feeRateRange: FeeRateRange
}

export interface FeeRateRange {
  min: number
  max: number
}

export interface Miner {
  address: string
  satoshi: number
  pendingSatoshi: number
  transactionCount: number
}

export module RGBppLatestTransaction {
  export interface Response {
    rgbppLatestTransactions: {
      txs: RGBppTransaction[]
      total: number
      pageSize: number
    }
  }
}

export module BlockHeightAndTxns24H {
  export interface Response {
    ckbChainInfo: Pick<CkbChainInfo, 'tipBlockNumber'>
    btcChainInfo: Pick<BtcChainInfo, 'tipBlockHeight'>
  }
}

export module RGBppCoinList {
  export interface Response {
    rgbppCoinList: {
      total: number
      page: number
      coins: RGBppCoin[]
    }
  }
}

export module RGBppCoin {
  export interface Response {
    rgbppCoin: Pick<RGBppCoin, 'name' | 'symbol' | 'icon'>
  }
}

export module RGBppCoinTransactionList {
  export interface Response {
    rgbppCoin: {
      transactions: RGBppTransaction[]
    }
  }
}
