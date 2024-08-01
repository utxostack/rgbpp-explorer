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
  transactionsCountIn24Hours: number
  fees: {
    fast: number
    slow: number
    average: number
  }
}

export interface BtcChainInfo {
  tipBlockHeight: number
  tipBlockHash: number
  difficulty: number
  transactionsCountIn24Hours: number
  fees: {
    fastest: number
    halfHour: number
    hour: number
    economy: number
    minimum: number
  }
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
  status: {
    consumed: boolean
    txHash: string
    index: number
  }
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
  transactionsCount: number
}

export interface RGBppAddress {
  address: string
  utxosCount: number
  cellsCount: number
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

export interface BtcUtxoStatus {
  spent: boolean
  txid: string
  vin: number
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
  status: BtcUtxoStatus
}

export interface Prevout {
  scriptpubkey: string
  scriptpubkeyAsm: string
  scriptpubkeyType: string
  scriptpubkeyAddress: string
  value: number
  address: BtcAddress
  status: BtcUtxoStatus
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
  miner: CkbAddress
  reward: number
}

export interface BtcBlock {
  id: string
  height: number
  version: number
  timestamp: number
  transactionsCount: number
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

export interface RgbppStatistic {
  transactionsCount: number
  holdersCount: number
}

export interface SearchResult {
  search: {
    query: string
    btcBlock: string
    btcTransaction: string
    btcAddress: string
    ckbBlock: string
    ckbTransaction: string
    ckbAddress: string
    rgbppCoin: string
  }
}
