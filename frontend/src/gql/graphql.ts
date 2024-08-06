/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** `Date` type as integer. Type represents date and time as number of milliseconds from start of UNIX epoch. */
  Timestamp: { input: any; output: any; }
};

/** Bitcoin Address */
export type BitcoinAddress = {
  __typename?: 'BitcoinAddress';
  address: Scalars['String']['output'];
  pendingSatoshi: Scalars['Float']['output'];
  rgbppAddress: RgbppAddress;
  satoshi: Scalars['Float']['output'];
  transactions: Array<BitcoinTransaction>;
  transactionsCount?: Maybe<Scalars['Float']['output']>;
};


/** Bitcoin Address */
export type BitcoinAddressTransactionsArgs = {
  afterTxid?: InputMaybe<Scalars['String']['input']>;
};

/** Bitcoin Block */
export type BitcoinBlock = {
  __typename?: 'BitcoinBlock';
  bits: Scalars['Float']['output'];
  difficulty: Scalars['Float']['output'];
  feeRateRange: FeeRateRange;
  height: Scalars['Float']['output'];
  id: Scalars['String']['output'];
  miner: BitcoinAddress;
  reward: Scalars['Float']['output'];
  size: Scalars['Float']['output'];
  timestamp: Scalars['Timestamp']['output'];
  totalFee: Scalars['Float']['output'];
  transactions: Array<BitcoinTransaction>;
  transactionsCount: Scalars['Float']['output'];
  version: Scalars['Int']['output'];
  weight: Scalars['Float']['output'];
};


/** Bitcoin Block */
export type BitcoinBlockTransactionsArgs = {
  startIndex?: InputMaybe<Scalars['Float']['input']>;
};

/** Bitcoin ChainInfo */
export type BitcoinChainInfo = {
  __typename?: 'BitcoinChainInfo';
  difficulty: Scalars['Float']['output'];
  fees: BitcoinFees;
  tipBlockHash: Scalars['String']['output'];
  tipBlockHeight: Scalars['Float']['output'];
  transactionsCountIn24Hours: Scalars['Float']['output'];
};

/** Bitcoin Fees */
export type BitcoinFees = {
  __typename?: 'BitcoinFees';
  economy: Scalars['Float']['output'];
  fastest: Scalars['Float']['output'];
  halfHour: Scalars['Float']['output'];
  hour: Scalars['Float']['output'];
  minimum: Scalars['Float']['output'];
};

/** Bitcoin Input */
export type BitcoinInput = {
  __typename?: 'BitcoinInput';
  isCoinbase: Scalars['Boolean']['output'];
  prevout?: Maybe<BitcoinOutput>;
  scriptsig: Scalars['String']['output'];
  scriptsigAsm: Scalars['String']['output'];
  sequence: Scalars['Float']['output'];
  txid: Scalars['String']['output'];
  vout: Scalars['Float']['output'];
};

/** Bitcoin Output */
export type BitcoinOutput = {
  __typename?: 'BitcoinOutput';
  address?: Maybe<BitcoinAddress>;
  scriptpubkey: Scalars['String']['output'];
  scriptpubkeyAddress?: Maybe<Scalars['String']['output']>;
  scriptpubkeyAsm: Scalars['String']['output'];
  scriptpubkeyType: Scalars['String']['output'];
  status: BitcoinOutputStatus;
  txid: Scalars['String']['output'];
  value: Scalars['Float']['output'];
  vout: Scalars['Float']['output'];
};

/** Bitcoin Output Spend Status */
export type BitcoinOutputStatus = {
  __typename?: 'BitcoinOutputStatus';
  spent: Scalars['Boolean']['output'];
  txid?: Maybe<Scalars['String']['output']>;
  vin?: Maybe<Scalars['Float']['output']>;
};

/** Bitcoin Transaction */
export type BitcoinTransaction = {
  __typename?: 'BitcoinTransaction';
  block: BitcoinBlock;
  blockHash?: Maybe<Scalars['String']['output']>;
  blockHeight?: Maybe<Scalars['Float']['output']>;
  confirmations: Scalars['Float']['output'];
  confirmed: Scalars['Boolean']['output'];
  fee: Scalars['Float']['output'];
  feeRate: Scalars['Float']['output'];
  locktime: Scalars['Float']['output'];
  rgbppTransaction?: Maybe<RgbppTransaction>;
  size: Scalars['Float']['output'];
  txid: Scalars['String']['output'];
  version: Scalars['Int']['output'];
  vin?: Maybe<Array<BitcoinInput>>;
  vout: Array<BitcoinOutput>;
  weight: Scalars['Float']['output'];
};

/** Cell type (XUDT, SUDT, Dobs, mNFT) */
export enum CellType {
  Dob = 'DOB',
  Mnft = 'MNFT',
  Sudt = 'SUDT',
  Xudt = 'XUDT'
}

/** CKB Address */
export type CkbAddress = {
  __typename?: 'CkbAddress';
  address: Scalars['String']['output'];
  shannon: Scalars['Float']['output'];
  transactions: Array<CkbTransaction>;
  transactionsCount: Scalars['Float']['output'];
};


/** CKB Address */
export type CkbAddressTransactionsArgs = {
  page?: InputMaybe<Scalars['Float']['input']>;
  pageSize?: InputMaybe<Scalars['Float']['input']>;
};

/** CKB Block */
export type CkbBlock = {
  __typename?: 'CkbBlock';
  confirmations?: Maybe<Scalars['Float']['output']>;
  hash: Scalars['String']['output'];
  miner: CkbAddress;
  number: Scalars['Int']['output'];
  reward: Scalars['Float']['output'];
  size?: Maybe<Scalars['Float']['output']>;
  timestamp: Scalars['Timestamp']['output'];
  totalFee: Scalars['Float']['output'];
  transactions: Array<CkbTransaction>;
  transactionsCount: Scalars['Int']['output'];
  version: Scalars['Int']['output'];
};

/** CKB Cell */
export type CkbCell = {
  __typename?: 'CkbCell';
  capacity: Scalars['Float']['output'];
  cellType?: Maybe<CellType>;
  index: Scalars['Int']['output'];
  lock: CkbScript;
  status: CkbCellStatus;
  txHash: Scalars['String']['output'];
  type?: Maybe<CkbScript>;
  xudtInfo?: Maybe<CkbXudtInfo>;
};

/** CKB Cell Status */
export type CkbCellStatus = {
  __typename?: 'CkbCellStatus';
  consumed: Scalars['Boolean']['output'];
  index?: Maybe<Scalars['Float']['output']>;
  txHash?: Maybe<Scalars['String']['output']>;
};

/** CKB ChainInfo */
export type CkbChainInfo = {
  __typename?: 'CkbChainInfo';
  fees: CkbFees;
  tipBlockNumber: Scalars['Float']['output'];
  transactionsCountIn24Hours: Scalars['Float']['output'];
};

/** CKB Fees */
export type CkbFees = {
  __typename?: 'CkbFees';
  average: Scalars['Float']['output'];
  fast: Scalars['Float']['output'];
  slow: Scalars['Float']['output'];
};

/** CKB Script */
export type CkbScript = {
  __typename?: 'CkbScript';
  args: Scalars['String']['output'];
  codeHash: Scalars['String']['output'];
  hashType: Scalars['String']['output'];
};

/** CKB Script */
export type CkbScriptInput = {
  args: Scalars['String']['input'];
  codeHash: Scalars['String']['input'];
  hashType: Scalars['String']['input'];
};

/** Search key for CKB transactions */
export type CkbSearchKeyInput = {
  script: CkbScriptInput;
  scriptType: Scalars['String']['input'];
};

/** CKB Transaction */
export type CkbTransaction = {
  __typename?: 'CkbTransaction';
  block: CkbBlock;
  blockNumber: Scalars['Float']['output'];
  confirmations: Scalars['Float']['output'];
  confirmed: Scalars['Boolean']['output'];
  fee: Scalars['Float']['output'];
  feeRate: Scalars['Float']['output'];
  hash: Scalars['String']['output'];
  inputs: Array<CkbCell>;
  isCellbase: Scalars['Boolean']['output'];
  outputs: Array<CkbCell>;
  size: Scalars['Float']['output'];
};

/** CKB XUDT Info */
export type CkbXudtInfo = {
  __typename?: 'CkbXUDTInfo';
  amount: Scalars['String']['output'];
  decimal: Scalars['Int']['output'];
  symbol: Scalars['String']['output'];
  typeHash: Scalars['String']['output'];
};

/** Fee Rate Range */
export type FeeRateRange = {
  __typename?: 'FeeRateRange';
  max: Scalars['Float']['output'];
  min: Scalars['Float']['output'];
};

export enum LeapDirection {
  LeapIn = 'LeapIn',
  LeapOut = 'LeapOut',
  Within = 'Within'
}

export enum OrderType {
  Asc = 'Asc',
  Desc = 'Desc'
}

export type Query = {
  __typename?: 'Query';
  btcAddress?: Maybe<BitcoinAddress>;
  btcBlock?: Maybe<BitcoinBlock>;
  btcChainInfo: BitcoinChainInfo;
  btcTransaction?: Maybe<BitcoinTransaction>;
  ckbAddress?: Maybe<CkbAddress>;
  ckbBlock?: Maybe<CkbBlock>;
  ckbChainInfo: CkbChainInfo;
  ckbTransaction?: Maybe<CkbTransaction>;
  ckbTransactions: Array<CkbTransaction>;
  rgbppAddress?: Maybe<RgbppAddress>;
  rgbppCoin?: Maybe<RgbppCoin>;
  rgbppCoins: RgbppCoinList;
  rgbppLatestTransactions: RgbppLatestTransactionList;
  rgbppStatistic: RgbppStatistic;
  rgbppTransaction?: Maybe<RgbppTransaction>;
  search: SearchResult;
};


export type QueryBtcAddressArgs = {
  address: Scalars['String']['input'];
};


export type QueryBtcBlockArgs = {
  hashOrHeight: Scalars['String']['input'];
};


export type QueryBtcTransactionArgs = {
  txid: Scalars['String']['input'];
};


export type QueryCkbAddressArgs = {
  address: Scalars['String']['input'];
};


export type QueryCkbBlockArgs = {
  heightOrHash: Scalars['String']['input'];
};


export type QueryCkbTransactionArgs = {
  txHash: Scalars['String']['input'];
};


export type QueryCkbTransactionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Float']['input']>;
  order?: InputMaybe<OrderType>;
  scriptKey?: InputMaybe<CkbSearchKeyInput>;
  types?: InputMaybe<Array<CellType>>;
};


export type QueryRgbppAddressArgs = {
  address: Scalars['String']['input'];
};


export type QueryRgbppCoinArgs = {
  typeHash: Scalars['String']['input'];
};


export type QueryRgbppCoinsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<TransactionListSortType>;
};


export type QueryRgbppLatestTransactionsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryRgbppTransactionArgs = {
  txidOrTxHash: Scalars['String']['input'];
};


export type QuerySearchArgs = {
  query: Scalars['String']['input'];
};

/** Rgbpp Address */
export type RgbppAddress = {
  __typename?: 'RgbppAddress';
  address: Scalars['String']['output'];
  assets: Array<RgbppAsset>;
  balances: Array<CkbXudtInfo>;
  cellsCount: Scalars['Float']['output'];
  utxosCount: Scalars['Float']['output'];
};

/** Rgbpp Asset */
export type RgbppAsset = {
  __typename?: 'RgbppAsset';
  cell: CkbCell;
  owner: Scalars['String']['output'];
  utxo?: Maybe<BitcoinOutput>;
};

/** RGB++ Coin */
export type RgbppCoin = {
  __typename?: 'RgbppCoin';
  decimal: Scalars['Float']['output'];
  deployedAt: Scalars['Timestamp']['output'];
  description?: Maybe<Scalars['String']['output']>;
  h24CkbTransactionsCount: Scalars['Int']['output'];
  holdersCount: Scalars['Int']['output'];
  icon?: Maybe<Scalars['String']['output']>;
  issuer: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  symbol: Scalars['String']['output'];
  totalAmount: Scalars['Float']['output'];
  transactions?: Maybe<Array<RgbppTransaction>>;
  transactionsCount?: Maybe<Scalars['Float']['output']>;
  typeHash?: Maybe<Scalars['String']['output']>;
  typeScript?: Maybe<CkbScript>;
};


/** RGB++ Coin */
export type RgbppCoinTransactionsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};

/** RGB++ Coin List */
export type RgbppCoinList = {
  __typename?: 'RgbppCoinList';
  coins: Array<RgbppCoin>;
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

/** RGB++ latest transaction list */
export type RgbppLatestTransactionList = {
  __typename?: 'RgbppLatestTransactionList';
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  txs: Array<RgbppTransaction>;
};

/** RGB++ Coin */
export type RgbppStatistic = {
  __typename?: 'RgbppStatistic';
  holdersCount: Scalars['Float']['output'];
  transactionsCount: Scalars['Float']['output'];
};

/** RGB++ Transaction */
export type RgbppTransaction = {
  __typename?: 'RgbppTransaction';
  blockNumber: Scalars['Int']['output'];
  btcTransaction?: Maybe<BitcoinTransaction>;
  btcTxid?: Maybe<Scalars['String']['output']>;
  ckbTransaction?: Maybe<CkbTransaction>;
  ckbTxHash: Scalars['String']['output'];
  leapDirection?: Maybe<LeapDirection>;
  timestamp: Scalars['Timestamp']['output'];
};

/** Search Result (including address/tx/block) */
export type SearchResult = {
  __typename?: 'SearchResult';
  btcAddress?: Maybe<Scalars['String']['output']>;
  btcBlock?: Maybe<Scalars['String']['output']>;
  btcTransaction?: Maybe<Scalars['String']['output']>;
  ckbAddress?: Maybe<Scalars['String']['output']>;
  ckbBlock?: Maybe<Scalars['String']['output']>;
  ckbTransaction?: Maybe<Scalars['String']['output']>;
  query: Scalars['String']['output'];
  rgbppCoin?: Maybe<Scalars['String']['output']>;
};

export enum TransactionListSortType {
  AddressCountAsc = 'AddressCountAsc',
  AddressCountDesc = 'AddressCountDesc',
  CreatedTimeAsc = 'CreatedTimeAsc',
  CreatedTimeDesc = 'CreatedTimeDesc',
  TransactionsAsc = 'TransactionsAsc',
  TransactionsDesc = 'TransactionsDesc'
}

export type BtcAddressBaseQueryVariables = Exact<{
  address: Scalars['String']['input'];
}>;


export type BtcAddressBaseQuery = { __typename?: 'Query', btcAddress?: { __typename?: 'BitcoinAddress', address: string, satoshi: number, pendingSatoshi: number, transactionsCount?: number | null } | null };

export type CkbAddressBaseQueryVariables = Exact<{
  address: Scalars['String']['input'];
}>;


export type CkbAddressBaseQuery = { __typename?: 'Query', ckbAddress?: { __typename?: 'CkbAddress', address: string, shannon: number, transactionsCount: number } | null };

export type BtcTransactionByAddressQueryVariables = Exact<{
  address: Scalars['String']['input'];
}>;


export type BtcTransactionByAddressQuery = { __typename?: 'Query', btcAddress?: { __typename?: 'BitcoinAddress', transactions: Array<{ __typename?: 'BitcoinTransaction', blockHeight?: number | null, blockHash?: string | null, txid: string, version: number, size: number, locktime: number, weight: number, fee: number, feeRate: number, confirmed: boolean, confirmations: number, vin?: Array<{ __typename?: 'BitcoinInput', txid: string, vout: number, scriptsig: string, scriptsigAsm: string, isCoinbase: boolean, sequence: number, prevout?: { __typename?: 'BitcoinOutput', scriptpubkey: string, scriptpubkeyAsm: string, scriptpubkeyType: string, scriptpubkeyAddress?: string | null, value: number, status: { __typename?: 'BitcoinOutputStatus', spent: boolean, txid?: string | null, vin?: number | null }, address?: { __typename?: 'BitcoinAddress', address: string, satoshi: number, pendingSatoshi: number, transactionsCount?: number | null } | null } | null }> | null, vout: Array<{ __typename?: 'BitcoinOutput', scriptpubkey: string, scriptpubkeyAsm: string, scriptpubkeyType: string, scriptpubkeyAddress?: string | null, value: number, status: { __typename?: 'BitcoinOutputStatus', spent: boolean, txid?: string | null, vin?: number | null }, address?: { __typename?: 'BitcoinAddress', address: string, satoshi: number, pendingSatoshi: number, transactionsCount?: number | null } | null }> }> } | null };

export type CkbAddressQueryVariables = Exact<{
  address: Scalars['String']['input'];
  page: Scalars['Float']['input'];
  pageSize: Scalars['Float']['input'];
}>;


export type CkbAddressQuery = { __typename?: 'Query', ckbAddress?: { __typename?: 'CkbAddress', transactions: Array<{ __typename?: 'CkbTransaction', isCellbase: boolean, blockNumber: number, hash: string, fee: number, size: number, feeRate: number, confirmations: number, inputs: Array<{ __typename?: 'CkbCell', cellType?: CellType | null, txHash: string, index: number, capacity: number, status: { __typename?: 'CkbCellStatus', consumed: boolean, txHash?: string | null, index?: number | null }, type?: { __typename?: 'CkbScript', codeHash: string, hashType: string, args: string } | null, lock: { __typename?: 'CkbScript', codeHash: string, hashType: string, args: string }, xudtInfo?: { __typename?: 'CkbXUDTInfo', symbol: string, amount: string, decimal: number, typeHash: string } | null }>, outputs: Array<{ __typename?: 'CkbCell', txHash: string, cellType?: CellType | null, index: number, capacity: number, type?: { __typename?: 'CkbScript', codeHash: string, hashType: string, args: string } | null, lock: { __typename?: 'CkbScript', codeHash: string, hashType: string, args: string }, xudtInfo?: { __typename?: 'CkbXUDTInfo', symbol: string, amount: string, decimal: number, typeHash: string } | null, status: { __typename?: 'CkbCellStatus', consumed: boolean, txHash?: string | null, index?: number | null } }>, block: { __typename?: 'CkbBlock', timestamp: any, number: number } }> } | null };

export type RgbppCoinQueryVariables = Exact<{
  typeHash: Scalars['String']['input'];
}>;


export type RgbppCoinQuery = { __typename?: 'Query', rgbppCoin?: { __typename?: 'RgbppCoin', name?: string | null, symbol: string, icon?: string | null } | null };

export type RgbppCoinTransactionsByTypeHashQueryVariables = Exact<{
  typeHash: Scalars['String']['input'];
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
}>;


export type RgbppCoinTransactionsByTypeHashQuery = { __typename?: 'Query', rgbppCoin?: { __typename?: 'RgbppCoin', transactionsCount?: number | null, transactions?: Array<{ __typename?: 'RgbppTransaction', ckbTxHash: string, btcTxid?: string | null, leapDirection?: LeapDirection | null, blockNumber: number, timestamp: any, ckbTransaction?: { __typename?: 'CkbTransaction', isCellbase: boolean, blockNumber: number, hash: string, fee: number, feeRate: number, size: number, confirmations: number, inputs: Array<{ __typename?: 'CkbCell', txHash: string, index: number, capacity: number, status: { __typename?: 'CkbCellStatus', consumed: boolean, txHash?: string | null, index?: number | null }, type?: { __typename?: 'CkbScript', codeHash: string, hashType: string, args: string } | null, lock: { __typename?: 'CkbScript', codeHash: string, hashType: string, args: string }, xudtInfo?: { __typename?: 'CkbXUDTInfo', symbol: string, amount: string, decimal: number, typeHash: string } | null }>, outputs: Array<{ __typename?: 'CkbCell', txHash: string, index: number, capacity: number, status: { __typename?: 'CkbCellStatus', consumed: boolean, txHash?: string | null, index?: number | null }, type?: { __typename?: 'CkbScript', codeHash: string, hashType: string, args: string } | null, lock: { __typename?: 'CkbScript', codeHash: string, hashType: string, args: string }, xudtInfo?: { __typename?: 'CkbXUDTInfo', symbol: string, amount: string, decimal: number, typeHash: string } | null }> } | null, btcTransaction?: { __typename?: 'BitcoinTransaction', blockHeight?: number | null, blockHash?: string | null, txid: string, version: number, size: number, locktime: number, weight: number, fee: number, feeRate: number, confirmed: boolean, confirmations: number, vin?: Array<{ __typename?: 'BitcoinInput', txid: string, vout: number, scriptsig: string, scriptsigAsm: string, isCoinbase: boolean, sequence: number, prevout?: { __typename?: 'BitcoinOutput', scriptpubkey: string, scriptpubkeyAsm: string, scriptpubkeyType: string, scriptpubkeyAddress?: string | null, value: number, status: { __typename?: 'BitcoinOutputStatus', spent: boolean, txid?: string | null, vin?: number | null }, address?: { __typename?: 'BitcoinAddress', address: string, satoshi: number, pendingSatoshi: number, transactionsCount?: number | null } | null } | null }> | null, vout: Array<{ __typename?: 'BitcoinOutput', scriptpubkey: string, scriptpubkeyAsm: string, scriptpubkeyType: string, scriptpubkeyAddress?: string | null, value: number, status: { __typename?: 'BitcoinOutputStatus', spent: boolean, txid?: string | null, vin?: number | null }, address?: { __typename?: 'BitcoinAddress', address: string, satoshi: number, pendingSatoshi: number, transactionsCount?: number | null } | null }> } | null }> | null } | null };

export type RgbppCoinsQueryVariables = Exact<{
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
}>;


export type RgbppCoinsQuery = { __typename?: 'Query', rgbppCoins: { __typename?: 'RgbppCoinList', total: number, pageSize: number, coins: Array<{ __typename?: 'RgbppCoin', icon?: string | null, name?: string | null, symbol: string, holdersCount: number, h24CkbTransactionsCount: number, totalAmount: number, deployedAt: any, decimal: number, typeHash?: string | null }> } };

export type BtcBlockQueryVariables = Exact<{
  hashOrHeight: Scalars['String']['input'];
}>;


export type BtcBlockQuery = { __typename?: 'Query', btcBlock?: { __typename?: 'BitcoinBlock', id: string, height: number, version: number, timestamp: any, transactionsCount: number, size: number, weight: number, bits: number, difficulty: number, totalFee: number, miner: { __typename?: 'BitcoinAddress', address: string, satoshi: number, pendingSatoshi: number, transactionsCount?: number | null }, feeRateRange: { __typename?: 'FeeRateRange', min: number, max: number } } | null };

export type BtcBlockTransactionQueryVariables = Exact<{
  hashOrHeight: Scalars['String']['input'];
}>;


export type BtcBlockTransactionQuery = { __typename?: 'Query', btcBlock?: { __typename?: 'BitcoinBlock', timestamp: any, transactions: Array<{ __typename?: 'BitcoinTransaction', blockHeight?: number | null, blockHash?: string | null, txid: string, version: number, size: number, locktime: number, weight: number, fee: number, feeRate: number, confirmed: boolean, vout: Array<{ __typename?: 'BitcoinOutput', scriptpubkey: string, scriptpubkeyAsm: string, scriptpubkeyType: string, scriptpubkeyAddress?: string | null, value: number, status: { __typename?: 'BitcoinOutputStatus', spent: boolean, txid?: string | null, vin?: number | null }, address?: { __typename?: 'BitcoinAddress', address: string, satoshi: number, pendingSatoshi: number, transactionsCount?: number | null } | null }>, vin?: Array<{ __typename?: 'BitcoinInput', txid: string, vout: number, scriptsig: string, scriptsigAsm: string, isCoinbase: boolean, sequence: number, prevout?: { __typename?: 'BitcoinOutput', scriptpubkey: string, scriptpubkeyAsm: string, scriptpubkeyType: string, scriptpubkeyAddress?: string | null, value: number, status: { __typename?: 'BitcoinOutputStatus', spent: boolean, txid?: string | null, vin?: number | null }, address?: { __typename?: 'BitcoinAddress', address: string, satoshi: number, pendingSatoshi: number, transactionsCount?: number | null } | null } | null }> | null }> } | null };

export type CkbBlockQueryVariables = Exact<{
  hashOrHeight: Scalars['String']['input'];
}>;


export type CkbBlockQuery = { __typename?: 'Query', ckbBlock?: { __typename?: 'CkbBlock', version: number, hash: string, number: number, timestamp: any, transactionsCount: number, totalFee: number, reward: number, size?: number | null, confirmations?: number | null, miner: { __typename?: 'CkbAddress', address: string, shannon: number, transactionsCount: number } } | null };

export type CkbBlockTransactionsQueryVariables = Exact<{
  hashOrHeight: Scalars['String']['input'];
}>;


export type CkbBlockTransactionsQuery = { __typename?: 'Query', ckbBlock?: { __typename?: 'CkbBlock', timestamp: any, transactions: Array<{ __typename?: 'CkbTransaction', isCellbase: boolean, blockNumber: number, hash: string, fee: number, size: number, feeRate: number, confirmations: number, outputs: Array<{ __typename?: 'CkbCell', txHash: string, index: number, capacity: number, lock: { __typename?: 'CkbScript', codeHash: string, hashType: string, args: string }, type?: { __typename?: 'CkbScript', codeHash: string, hashType: string, args: string } | null, xudtInfo?: { __typename?: 'CkbXUDTInfo', symbol: string, amount: string, decimal: number, typeHash: string } | null, status: { __typename?: 'CkbCellStatus', consumed: boolean, txHash?: string | null, index?: number | null } }>, inputs: Array<{ __typename?: 'CkbCell', txHash: string, index: number, capacity: number, status: { __typename?: 'CkbCellStatus', consumed: boolean, txHash?: string | null, index?: number | null }, lock: { __typename?: 'CkbScript', codeHash: string, hashType: string, args: string }, type?: { __typename?: 'CkbScript', codeHash: string, hashType: string, args: string } | null, xudtInfo?: { __typename?: 'CkbXUDTInfo', symbol: string, amount: string, decimal: number, typeHash: string } | null }> }> } | null };

export type BtcChainInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type BtcChainInfoQuery = { __typename?: 'Query', btcChainInfo: { __typename?: 'BitcoinChainInfo', tipBlockHeight: number, tipBlockHash: string, difficulty: number, transactionsCountIn24Hours: number, fees: { __typename?: 'BitcoinFees', fastest: number, halfHour: number, hour: number, economy: number, minimum: number } }, rgbppStatistic: { __typename?: 'RgbppStatistic', holdersCount: number } };

export type RgbppLatestTransactionsQueryVariables = Exact<{
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
}>;


export type RgbppLatestTransactionsQuery = { __typename?: 'Query', rgbppLatestTransactions: { __typename?: 'RgbppLatestTransactionList', total: number, pageSize: number, txs: Array<{ __typename?: 'RgbppTransaction', ckbTxHash: string, btcTxid?: string | null, leapDirection?: LeapDirection | null, blockNumber: number, timestamp: any, ckbTransaction?: { __typename?: 'CkbTransaction', blockNumber: number, hash: string, fee: number, size: number, inputs: Array<{ __typename?: 'CkbCell', txHash: string, index: number, capacity: number, cellType?: CellType | null, status: { __typename?: 'CkbCellStatus', consumed: boolean, txHash?: string | null, index?: number | null }, lock: { __typename?: 'CkbScript', codeHash: string, hashType: string, args: string }, xudtInfo?: { __typename?: 'CkbXUDTInfo', symbol: string, amount: string, decimal: number } | null }>, outputs: Array<{ __typename?: 'CkbCell', txHash: string, index: number, capacity: number, lock: { __typename?: 'CkbScript', codeHash: string, hashType: string, args: string }, xudtInfo?: { __typename?: 'CkbXUDTInfo', symbol: string, amount: string, decimal: number } | null, status: { __typename?: 'CkbCellStatus', consumed: boolean, txHash?: string | null, index?: number | null } }> } | null, btcTransaction?: { __typename?: 'BitcoinTransaction', blockHeight?: number | null, blockHash?: string | null, txid: string, version: number, size: number, locktime: number, weight: number, fee: number, confirmed: boolean } | null }> } };

export type CkbChainInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type CkbChainInfoQuery = { __typename?: 'Query', ckbChainInfo: { __typename?: 'CkbChainInfo', tipBlockNumber: number, transactionsCountIn24Hours: number, fees: { __typename?: 'CkbFees', fast: number, slow: number, average: number } }, rgbppStatistic: { __typename?: 'RgbppStatistic', holdersCount: number } };

export type RgbppTransactionQueryVariables = Exact<{
  txidOrTxHash: Scalars['String']['input'];
}>;


export type RgbppTransactionQuery = { __typename?: 'Query', rgbppTransaction?: { __typename?: 'RgbppTransaction', ckbTxHash: string, btcTxid?: string | null, leapDirection?: LeapDirection | null, blockNumber: number, timestamp: any, btcTransaction?: { __typename?: 'BitcoinTransaction', blockHeight?: number | null, blockHash?: string | null, txid: string, version: number, size: number, weight: number, fee: number, feeRate: number, confirmed: boolean, confirmations: number, block: { __typename?: 'BitcoinBlock', timestamp: any }, vin?: Array<{ __typename?: 'BitcoinInput', txid: string, vout: number, scriptsig: string, scriptsigAsm: string, isCoinbase: boolean, sequence: number, prevout?: { __typename?: 'BitcoinOutput', txid: string, vout: number, scriptpubkey: string, scriptpubkeyAsm: string, scriptpubkeyType: string, scriptpubkeyAddress?: string | null, value: number, address?: { __typename?: 'BitcoinAddress', address: string, satoshi: number, pendingSatoshi: number, transactionsCount?: number | null } | null, status: { __typename?: 'BitcoinOutputStatus', spent: boolean, txid?: string | null, vin?: number | null } } | null }> | null, vout: Array<{ __typename?: 'BitcoinOutput', txid: string, vout: number, scriptpubkey: string, scriptpubkeyAsm: string, scriptpubkeyType: string, scriptpubkeyAddress?: string | null, value: number, address?: { __typename?: 'BitcoinAddress', address: string, satoshi: number, pendingSatoshi: number, transactionsCount?: number | null } | null, status: { __typename?: 'BitcoinOutputStatus', spent: boolean, txid?: string | null, vin?: number | null } }> } | null, ckbTransaction?: { __typename?: 'CkbTransaction', isCellbase: boolean, blockNumber: number, hash: string, fee: number, feeRate: number, size: number, confirmed: boolean, confirmations: number, outputs: Array<{ __typename?: 'CkbCell', txHash: string, index: number, capacity: number, cellType?: CellType | null, type?: { __typename?: 'CkbScript', codeHash: string, hashType: string, args: string } | null, lock: { __typename?: 'CkbScript', codeHash: string, hashType: string, args: string }, status: { __typename?: 'CkbCellStatus', consumed: boolean, txHash?: string | null, index?: number | null }, xudtInfo?: { __typename?: 'CkbXUDTInfo', symbol: string, amount: string, decimal: number, typeHash: string } | null }>, inputs: Array<{ __typename?: 'CkbCell', txHash: string, index: number, capacity: number, cellType?: CellType | null, type?: { __typename?: 'CkbScript', codeHash: string, hashType: string, args: string } | null, lock: { __typename?: 'CkbScript', codeHash: string, hashType: string, args: string }, xudtInfo?: { __typename?: 'CkbXUDTInfo', symbol: string, amount: string, decimal: number, typeHash: string } | null, status: { __typename?: 'CkbCellStatus', consumed: boolean, txHash?: string | null, index?: number | null } }>, block: { __typename?: 'CkbBlock', timestamp: any, hash: string } } | null } | null, btcTransaction?: { __typename?: 'BitcoinTransaction', blockHeight?: number | null, blockHash?: string | null, txid: string, version: number, size: number, weight: number, fee: number, feeRate: number, confirmed: boolean, confirmations: number, block: { __typename?: 'BitcoinBlock', timestamp: any }, vin?: Array<{ __typename?: 'BitcoinInput', txid: string, vout: number, scriptsig: string, scriptsigAsm: string, isCoinbase: boolean, sequence: number, prevout?: { __typename?: 'BitcoinOutput', txid: string, vout: number, scriptpubkey: string, scriptpubkeyAsm: string, scriptpubkeyType: string, scriptpubkeyAddress?: string | null, value: number, address?: { __typename?: 'BitcoinAddress', address: string, satoshi: number, pendingSatoshi: number, transactionsCount?: number | null } | null, status: { __typename?: 'BitcoinOutputStatus', spent: boolean, txid?: string | null, vin?: number | null } } | null }> | null, vout: Array<{ __typename?: 'BitcoinOutput', txid: string, vout: number, scriptpubkey: string, scriptpubkeyAsm: string, scriptpubkeyType: string, scriptpubkeyAddress?: string | null, value: number, address?: { __typename?: 'BitcoinAddress', address: string, satoshi: number, pendingSatoshi: number, transactionsCount?: number | null } | null, status: { __typename?: 'BitcoinOutputStatus', spent: boolean, txid?: string | null, vin?: number | null } }> } | null, ckbTransaction?: { __typename?: 'CkbTransaction', isCellbase: boolean, blockNumber: number, hash: string, fee: number, feeRate: number, size: number, confirmed: boolean, confirmations: number, outputs: Array<{ __typename?: 'CkbCell', txHash: string, index: number, capacity: number, cellType?: CellType | null, type?: { __typename?: 'CkbScript', codeHash: string, hashType: string, args: string } | null, lock: { __typename?: 'CkbScript', codeHash: string, hashType: string, args: string }, status: { __typename?: 'CkbCellStatus', consumed: boolean, txHash?: string | null, index?: number | null }, xudtInfo?: { __typename?: 'CkbXUDTInfo', symbol: string, amount: string, decimal: number, typeHash: string } | null }>, inputs: Array<{ __typename?: 'CkbCell', txHash: string, index: number, capacity: number, cellType?: CellType | null, type?: { __typename?: 'CkbScript', codeHash: string, hashType: string, args: string } | null, lock: { __typename?: 'CkbScript', codeHash: string, hashType: string, args: string }, xudtInfo?: { __typename?: 'CkbXUDTInfo', symbol: string, amount: string, decimal: number, typeHash: string } | null, status: { __typename?: 'CkbCellStatus', consumed: boolean, txHash?: string | null, index?: number | null } }>, block: { __typename?: 'CkbBlock', timestamp: any, hash: string } } | null };

export type RgbppStatisticQueryVariables = Exact<{ [key: string]: never; }>;


export type RgbppStatisticQuery = { __typename?: 'Query', rgbppStatistic: { __typename?: 'RgbppStatistic', transactionsCount: number, holdersCount: number } };

export type CkbAndBtcChainInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type CkbAndBtcChainInfoQuery = { __typename?: 'Query', ckbChainInfo: { __typename?: 'CkbChainInfo', tipBlockNumber: number }, btcChainInfo: { __typename?: 'BitcoinChainInfo', tipBlockHeight: number, transactionsCountIn24Hours: number } };

export type SearchQueryVariables = Exact<{
  keyword: Scalars['String']['input'];
}>;


export type SearchQuery = { __typename?: 'Query', search: { __typename?: 'SearchResult', query: string, btcBlock?: string | null, btcTransaction?: string | null, btcAddress?: string | null, ckbBlock?: string | null, ckbTransaction?: string | null, ckbAddress?: string | null, rgbppCoin?: string | null } };

export type BtcAndCkbChainInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type BtcAndCkbChainInfoQuery = { __typename?: 'Query', ckbChainInfo: { __typename?: 'CkbChainInfo', tipBlockNumber: number }, btcChainInfo: { __typename?: 'BitcoinChainInfo', tipBlockHeight: number, transactionsCountIn24Hours: number } };


export const BtcAddressBaseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BtcAddressBase"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"address"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"btcAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"address"},"value":{"kind":"Variable","name":{"kind":"Name","value":"address"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"satoshi"}},{"kind":"Field","name":{"kind":"Name","value":"pendingSatoshi"}},{"kind":"Field","name":{"kind":"Name","value":"transactionsCount"}}]}}]}}]} as unknown as DocumentNode<BtcAddressBaseQuery, BtcAddressBaseQueryVariables>;
export const CkbAddressBaseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CkbAddressBase"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"address"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ckbAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"address"},"value":{"kind":"Variable","name":{"kind":"Name","value":"address"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"shannon"}},{"kind":"Field","name":{"kind":"Name","value":"transactionsCount"}}]}}]}}]} as unknown as DocumentNode<CkbAddressBaseQuery, CkbAddressBaseQueryVariables>;
export const BtcTransactionByAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BtcTransactionByAddress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"address"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"btcAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"address"},"value":{"kind":"Variable","name":{"kind":"Name","value":"address"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"blockHeight"}},{"kind":"Field","name":{"kind":"Name","value":"blockHash"}},{"kind":"Field","name":{"kind":"Name","value":"txid"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"locktime"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"fee"}},{"kind":"Field","name":{"kind":"Name","value":"feeRate"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed"}},{"kind":"Field","name":{"kind":"Name","value":"confirmations"}},{"kind":"Field","name":{"kind":"Name","value":"vin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"txid"}},{"kind":"Field","name":{"kind":"Name","value":"vout"}},{"kind":"Field","name":{"kind":"Name","value":"scriptsig"}},{"kind":"Field","name":{"kind":"Name","value":"scriptsigAsm"}},{"kind":"Field","name":{"kind":"Name","value":"isCoinbase"}},{"kind":"Field","name":{"kind":"Name","value":"sequence"}},{"kind":"Field","name":{"kind":"Name","value":"prevout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scriptpubkey"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyAsm"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyType"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyAddress"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spent"}},{"kind":"Field","name":{"kind":"Name","value":"txid"}},{"kind":"Field","name":{"kind":"Name","value":"vin"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"satoshi"}},{"kind":"Field","name":{"kind":"Name","value":"pendingSatoshi"}},{"kind":"Field","name":{"kind":"Name","value":"transactionsCount"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"vout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scriptpubkey"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyAsm"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyType"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyAddress"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spent"}},{"kind":"Field","name":{"kind":"Name","value":"txid"}},{"kind":"Field","name":{"kind":"Name","value":"vin"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"satoshi"}},{"kind":"Field","name":{"kind":"Name","value":"pendingSatoshi"}},{"kind":"Field","name":{"kind":"Name","value":"transactionsCount"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<BtcTransactionByAddressQuery, BtcTransactionByAddressQueryVariables>;
export const CkbAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CkbAddress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"address"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pageSize"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ckbAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"address"},"value":{"kind":"Variable","name":{"kind":"Name","value":"address"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"pageSize"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pageSize"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isCellbase"}},{"kind":"Field","name":{"kind":"Name","value":"blockNumber"}},{"kind":"Field","name":{"kind":"Name","value":"hash"}},{"kind":"Field","name":{"kind":"Name","value":"fee"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"feeRate"}},{"kind":"Field","name":{"kind":"Name","value":"confirmations"}},{"kind":"Field","name":{"kind":"Name","value":"inputs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cellType"}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"consumed"}},{"kind":"Field","name":{"kind":"Name","value":"txHash"}},{"kind":"Field","name":{"kind":"Name","value":"index"}}]}},{"kind":"Field","name":{"kind":"Name","value":"txHash"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codeHash"}},{"kind":"Field","name":{"kind":"Name","value":"hashType"}},{"kind":"Field","name":{"kind":"Name","value":"args"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codeHash"}},{"kind":"Field","name":{"kind":"Name","value":"hashType"}},{"kind":"Field","name":{"kind":"Name","value":"args"}}]}},{"kind":"Field","name":{"kind":"Name","value":"xudtInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"decimal"}},{"kind":"Field","name":{"kind":"Name","value":"typeHash"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"outputs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"txHash"}},{"kind":"Field","name":{"kind":"Name","value":"cellType"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codeHash"}},{"kind":"Field","name":{"kind":"Name","value":"hashType"}},{"kind":"Field","name":{"kind":"Name","value":"args"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codeHash"}},{"kind":"Field","name":{"kind":"Name","value":"hashType"}},{"kind":"Field","name":{"kind":"Name","value":"args"}}]}},{"kind":"Field","name":{"kind":"Name","value":"xudtInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"decimal"}},{"kind":"Field","name":{"kind":"Name","value":"typeHash"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"consumed"}},{"kind":"Field","name":{"kind":"Name","value":"txHash"}},{"kind":"Field","name":{"kind":"Name","value":"index"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"block"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"number"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CkbAddressQuery, CkbAddressQueryVariables>;
export const RgbppCoinDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RgbppCoin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"typeHash"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rgbppCoin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"typeHash"},"value":{"kind":"Variable","name":{"kind":"Name","value":"typeHash"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}}]}}]}}]} as unknown as DocumentNode<RgbppCoinQuery, RgbppCoinQueryVariables>;
export const RgbppCoinTransactionsByTypeHashDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RgbppCoinTransactionsByTypeHash"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"typeHash"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pageSize"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rgbppCoin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"typeHash"},"value":{"kind":"Variable","name":{"kind":"Name","value":"typeHash"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactionsCount"}},{"kind":"Field","name":{"kind":"Name","value":"transactions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"pageSize"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pageSize"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ckbTxHash"}},{"kind":"Field","name":{"kind":"Name","value":"btcTxid"}},{"kind":"Field","name":{"kind":"Name","value":"leapDirection"}},{"kind":"Field","name":{"kind":"Name","value":"blockNumber"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"ckbTransaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isCellbase"}},{"kind":"Field","name":{"kind":"Name","value":"blockNumber"}},{"kind":"Field","name":{"kind":"Name","value":"hash"}},{"kind":"Field","name":{"kind":"Name","value":"fee"}},{"kind":"Field","name":{"kind":"Name","value":"feeRate"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"confirmations"}},{"kind":"Field","name":{"kind":"Name","value":"inputs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"txHash"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"consumed"}},{"kind":"Field","name":{"kind":"Name","value":"txHash"}},{"kind":"Field","name":{"kind":"Name","value":"index"}}]}},{"kind":"Field","name":{"kind":"Name","value":"type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codeHash"}},{"kind":"Field","name":{"kind":"Name","value":"hashType"}},{"kind":"Field","name":{"kind":"Name","value":"args"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codeHash"}},{"kind":"Field","name":{"kind":"Name","value":"hashType"}},{"kind":"Field","name":{"kind":"Name","value":"args"}}]}},{"kind":"Field","name":{"kind":"Name","value":"xudtInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"decimal"}},{"kind":"Field","name":{"kind":"Name","value":"typeHash"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"outputs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"txHash"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"consumed"}},{"kind":"Field","name":{"kind":"Name","value":"txHash"}},{"kind":"Field","name":{"kind":"Name","value":"index"}}]}},{"kind":"Field","name":{"kind":"Name","value":"type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codeHash"}},{"kind":"Field","name":{"kind":"Name","value":"hashType"}},{"kind":"Field","name":{"kind":"Name","value":"args"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codeHash"}},{"kind":"Field","name":{"kind":"Name","value":"hashType"}},{"kind":"Field","name":{"kind":"Name","value":"args"}}]}},{"kind":"Field","name":{"kind":"Name","value":"xudtInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"decimal"}},{"kind":"Field","name":{"kind":"Name","value":"typeHash"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"btcTransaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"blockHeight"}},{"kind":"Field","name":{"kind":"Name","value":"blockHash"}},{"kind":"Field","name":{"kind":"Name","value":"txid"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"locktime"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"fee"}},{"kind":"Field","name":{"kind":"Name","value":"feeRate"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed"}},{"kind":"Field","name":{"kind":"Name","value":"confirmations"}},{"kind":"Field","name":{"kind":"Name","value":"vin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"txid"}},{"kind":"Field","name":{"kind":"Name","value":"vout"}},{"kind":"Field","name":{"kind":"Name","value":"scriptsig"}},{"kind":"Field","name":{"kind":"Name","value":"scriptsigAsm"}},{"kind":"Field","name":{"kind":"Name","value":"isCoinbase"}},{"kind":"Field","name":{"kind":"Name","value":"sequence"}},{"kind":"Field","name":{"kind":"Name","value":"prevout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scriptpubkey"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyAsm"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyType"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyAddress"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spent"}},{"kind":"Field","name":{"kind":"Name","value":"txid"}},{"kind":"Field","name":{"kind":"Name","value":"vin"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"satoshi"}},{"kind":"Field","name":{"kind":"Name","value":"pendingSatoshi"}},{"kind":"Field","name":{"kind":"Name","value":"transactionsCount"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"vout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scriptpubkey"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyAsm"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyType"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyAddress"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spent"}},{"kind":"Field","name":{"kind":"Name","value":"txid"}},{"kind":"Field","name":{"kind":"Name","value":"vin"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"satoshi"}},{"kind":"Field","name":{"kind":"Name","value":"pendingSatoshi"}},{"kind":"Field","name":{"kind":"Name","value":"transactionsCount"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<RgbppCoinTransactionsByTypeHashQuery, RgbppCoinTransactionsByTypeHashQueryVariables>;
export const RgbppCoinsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RgbppCoins"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pageSize"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rgbppCoins"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"pageSize"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pageSize"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"coins"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"holdersCount"}},{"kind":"Field","name":{"kind":"Name","value":"h24CkbTransactionsCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"deployedAt"}},{"kind":"Field","name":{"kind":"Name","value":"decimal"}},{"kind":"Field","name":{"kind":"Name","value":"typeHash"}}]}}]}}]}}]} as unknown as DocumentNode<RgbppCoinsQuery, RgbppCoinsQueryVariables>;
export const BtcBlockDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BtcBlock"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"hashOrHeight"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"btcBlock"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"hashOrHeight"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hashOrHeight"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"transactionsCount"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"bits"}},{"kind":"Field","name":{"kind":"Name","value":"difficulty"}},{"kind":"Field","name":{"kind":"Name","value":"totalFee"}},{"kind":"Field","name":{"kind":"Name","value":"miner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"satoshi"}},{"kind":"Field","name":{"kind":"Name","value":"pendingSatoshi"}},{"kind":"Field","name":{"kind":"Name","value":"transactionsCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"feeRateRange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"max"}}]}}]}}]}}]} as unknown as DocumentNode<BtcBlockQuery, BtcBlockQueryVariables>;
export const BtcBlockTransactionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BtcBlockTransaction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"hashOrHeight"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"btcBlock"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"hashOrHeight"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hashOrHeight"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"transactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"blockHeight"}},{"kind":"Field","name":{"kind":"Name","value":"blockHash"}},{"kind":"Field","name":{"kind":"Name","value":"txid"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"locktime"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"fee"}},{"kind":"Field","name":{"kind":"Name","value":"feeRate"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed"}},{"kind":"Field","name":{"kind":"Name","value":"vout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scriptpubkey"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyAsm"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyType"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyAddress"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spent"}},{"kind":"Field","name":{"kind":"Name","value":"txid"}},{"kind":"Field","name":{"kind":"Name","value":"vin"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"satoshi"}},{"kind":"Field","name":{"kind":"Name","value":"pendingSatoshi"}},{"kind":"Field","name":{"kind":"Name","value":"transactionsCount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"vin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"txid"}},{"kind":"Field","name":{"kind":"Name","value":"vout"}},{"kind":"Field","name":{"kind":"Name","value":"scriptsig"}},{"kind":"Field","name":{"kind":"Name","value":"scriptsigAsm"}},{"kind":"Field","name":{"kind":"Name","value":"isCoinbase"}},{"kind":"Field","name":{"kind":"Name","value":"sequence"}},{"kind":"Field","name":{"kind":"Name","value":"prevout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spent"}},{"kind":"Field","name":{"kind":"Name","value":"txid"}},{"kind":"Field","name":{"kind":"Name","value":"vin"}}]}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkey"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyAsm"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyType"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyAddress"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"satoshi"}},{"kind":"Field","name":{"kind":"Name","value":"pendingSatoshi"}},{"kind":"Field","name":{"kind":"Name","value":"transactionsCount"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<BtcBlockTransactionQuery, BtcBlockTransactionQueryVariables>;
export const CkbBlockDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CkbBlock"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"hashOrHeight"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ckbBlock"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"heightOrHash"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hashOrHeight"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"hash"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"transactionsCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalFee"}},{"kind":"Field","name":{"kind":"Name","value":"miner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"shannon"}},{"kind":"Field","name":{"kind":"Name","value":"transactionsCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reward"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"confirmations"}}]}}]}}]} as unknown as DocumentNode<CkbBlockQuery, CkbBlockQueryVariables>;
export const CkbBlockTransactionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CkbBlockTransactions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"hashOrHeight"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ckbBlock"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"heightOrHash"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hashOrHeight"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"transactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isCellbase"}},{"kind":"Field","name":{"kind":"Name","value":"blockNumber"}},{"kind":"Field","name":{"kind":"Name","value":"hash"}},{"kind":"Field","name":{"kind":"Name","value":"fee"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"feeRate"}},{"kind":"Field","name":{"kind":"Name","value":"confirmations"}},{"kind":"Field","name":{"kind":"Name","value":"outputs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"txHash"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"lock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codeHash"}},{"kind":"Field","name":{"kind":"Name","value":"hashType"}},{"kind":"Field","name":{"kind":"Name","value":"args"}}]}},{"kind":"Field","name":{"kind":"Name","value":"type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codeHash"}},{"kind":"Field","name":{"kind":"Name","value":"hashType"}},{"kind":"Field","name":{"kind":"Name","value":"args"}}]}},{"kind":"Field","name":{"kind":"Name","value":"xudtInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"decimal"}},{"kind":"Field","name":{"kind":"Name","value":"typeHash"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"consumed"}},{"kind":"Field","name":{"kind":"Name","value":"txHash"}},{"kind":"Field","name":{"kind":"Name","value":"index"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"inputs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"consumed"}},{"kind":"Field","name":{"kind":"Name","value":"txHash"}},{"kind":"Field","name":{"kind":"Name","value":"index"}}]}},{"kind":"Field","name":{"kind":"Name","value":"txHash"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"lock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codeHash"}},{"kind":"Field","name":{"kind":"Name","value":"hashType"}},{"kind":"Field","name":{"kind":"Name","value":"args"}}]}},{"kind":"Field","name":{"kind":"Name","value":"type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codeHash"}},{"kind":"Field","name":{"kind":"Name","value":"hashType"}},{"kind":"Field","name":{"kind":"Name","value":"args"}}]}},{"kind":"Field","name":{"kind":"Name","value":"xudtInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"decimal"}},{"kind":"Field","name":{"kind":"Name","value":"typeHash"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<CkbBlockTransactionsQuery, CkbBlockTransactionsQueryVariables>;
export const BtcChainInfoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BtcChainInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"btcChainInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tipBlockHeight"}},{"kind":"Field","name":{"kind":"Name","value":"tipBlockHash"}},{"kind":"Field","name":{"kind":"Name","value":"difficulty"}},{"kind":"Field","name":{"kind":"Name","value":"transactionsCountIn24Hours"}},{"kind":"Field","name":{"kind":"Name","value":"fees"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fastest"}},{"kind":"Field","name":{"kind":"Name","value":"halfHour"}},{"kind":"Field","name":{"kind":"Name","value":"hour"}},{"kind":"Field","name":{"kind":"Name","value":"economy"}},{"kind":"Field","name":{"kind":"Name","value":"minimum"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"rgbppStatistic"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"holdersCount"}}]}}]}}]} as unknown as DocumentNode<BtcChainInfoQuery, BtcChainInfoQueryVariables>;
export const RgbppLatestTransactionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RgbppLatestTransactions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pageSize"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rgbppLatestTransactions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"pageSize"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pageSize"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"txs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ckbTxHash"}},{"kind":"Field","name":{"kind":"Name","value":"btcTxid"}},{"kind":"Field","name":{"kind":"Name","value":"leapDirection"}},{"kind":"Field","name":{"kind":"Name","value":"blockNumber"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"ckbTransaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"blockNumber"}},{"kind":"Field","name":{"kind":"Name","value":"hash"}},{"kind":"Field","name":{"kind":"Name","value":"fee"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"inputs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"consumed"}},{"kind":"Field","name":{"kind":"Name","value":"txHash"}},{"kind":"Field","name":{"kind":"Name","value":"index"}}]}},{"kind":"Field","name":{"kind":"Name","value":"txHash"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"lock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codeHash"}},{"kind":"Field","name":{"kind":"Name","value":"hashType"}},{"kind":"Field","name":{"kind":"Name","value":"args"}}]}},{"kind":"Field","name":{"kind":"Name","value":"cellType"}},{"kind":"Field","name":{"kind":"Name","value":"xudtInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"decimal"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"outputs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"txHash"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"lock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codeHash"}},{"kind":"Field","name":{"kind":"Name","value":"hashType"}},{"kind":"Field","name":{"kind":"Name","value":"args"}}]}},{"kind":"Field","name":{"kind":"Name","value":"xudtInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"decimal"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"consumed"}},{"kind":"Field","name":{"kind":"Name","value":"txHash"}},{"kind":"Field","name":{"kind":"Name","value":"index"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"btcTransaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"blockHeight"}},{"kind":"Field","name":{"kind":"Name","value":"blockHash"}},{"kind":"Field","name":{"kind":"Name","value":"txid"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"locktime"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"fee"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}}]}}]}}]} as unknown as DocumentNode<RgbppLatestTransactionsQuery, RgbppLatestTransactionsQueryVariables>;
export const CkbChainInfoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CkbChainInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ckbChainInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tipBlockNumber"}},{"kind":"Field","name":{"kind":"Name","value":"transactionsCountIn24Hours"}},{"kind":"Field","name":{"kind":"Name","value":"fees"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fast"}},{"kind":"Field","name":{"kind":"Name","value":"slow"}},{"kind":"Field","name":{"kind":"Name","value":"average"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"rgbppStatistic"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"holdersCount"}}]}}]}}]} as unknown as DocumentNode<CkbChainInfoQuery, CkbChainInfoQueryVariables>;
export const RgbppTransactionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RgbppTransaction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"txidOrTxHash"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rgbppTransaction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"txidOrTxHash"},"value":{"kind":"Variable","name":{"kind":"Name","value":"txidOrTxHash"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ckbTxHash"}},{"kind":"Field","name":{"kind":"Name","value":"btcTxid"}},{"kind":"Field","name":{"kind":"Name","value":"leapDirection"}},{"kind":"Field","name":{"kind":"Name","value":"blockNumber"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"btcTransaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"blockHeight"}},{"kind":"Field","name":{"kind":"Name","value":"blockHash"}},{"kind":"Field","name":{"kind":"Name","value":"txid"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"block"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"fee"}},{"kind":"Field","name":{"kind":"Name","value":"feeRate"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed"}},{"kind":"Field","name":{"kind":"Name","value":"confirmations"}},{"kind":"Field","name":{"kind":"Name","value":"vin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"txid"}},{"kind":"Field","name":{"kind":"Name","value":"vout"}},{"kind":"Field","name":{"kind":"Name","value":"scriptsig"}},{"kind":"Field","name":{"kind":"Name","value":"scriptsigAsm"}},{"kind":"Field","name":{"kind":"Name","value":"isCoinbase"}},{"kind":"Field","name":{"kind":"Name","value":"sequence"}},{"kind":"Field","name":{"kind":"Name","value":"prevout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"txid"}},{"kind":"Field","name":{"kind":"Name","value":"vout"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkey"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyAsm"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyType"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyAddress"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"satoshi"}},{"kind":"Field","name":{"kind":"Name","value":"pendingSatoshi"}},{"kind":"Field","name":{"kind":"Name","value":"transactionsCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spent"}},{"kind":"Field","name":{"kind":"Name","value":"txid"}},{"kind":"Field","name":{"kind":"Name","value":"vin"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"vout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"txid"}},{"kind":"Field","name":{"kind":"Name","value":"vout"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkey"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyAsm"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyType"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyAddress"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"satoshi"}},{"kind":"Field","name":{"kind":"Name","value":"pendingSatoshi"}},{"kind":"Field","name":{"kind":"Name","value":"transactionsCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spent"}},{"kind":"Field","name":{"kind":"Name","value":"txid"}},{"kind":"Field","name":{"kind":"Name","value":"vin"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"ckbTransaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isCellbase"}},{"kind":"Field","name":{"kind":"Name","value":"blockNumber"}},{"kind":"Field","name":{"kind":"Name","value":"hash"}},{"kind":"Field","name":{"kind":"Name","value":"fee"}},{"kind":"Field","name":{"kind":"Name","value":"feeRate"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed"}},{"kind":"Field","name":{"kind":"Name","value":"confirmations"}},{"kind":"Field","name":{"kind":"Name","value":"outputs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"txHash"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"cellType"}},{"kind":"Field","name":{"kind":"Name","value":"type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codeHash"}},{"kind":"Field","name":{"kind":"Name","value":"hashType"}},{"kind":"Field","name":{"kind":"Name","value":"args"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codeHash"}},{"kind":"Field","name":{"kind":"Name","value":"hashType"}},{"kind":"Field","name":{"kind":"Name","value":"args"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"consumed"}},{"kind":"Field","name":{"kind":"Name","value":"txHash"}},{"kind":"Field","name":{"kind":"Name","value":"index"}}]}},{"kind":"Field","name":{"kind":"Name","value":"xudtInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"decimal"}},{"kind":"Field","name":{"kind":"Name","value":"typeHash"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"inputs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"txHash"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"cellType"}},{"kind":"Field","name":{"kind":"Name","value":"type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codeHash"}},{"kind":"Field","name":{"kind":"Name","value":"hashType"}},{"kind":"Field","name":{"kind":"Name","value":"args"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codeHash"}},{"kind":"Field","name":{"kind":"Name","value":"hashType"}},{"kind":"Field","name":{"kind":"Name","value":"args"}}]}},{"kind":"Field","name":{"kind":"Name","value":"xudtInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"decimal"}},{"kind":"Field","name":{"kind":"Name","value":"typeHash"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"consumed"}},{"kind":"Field","name":{"kind":"Name","value":"txHash"}},{"kind":"Field","name":{"kind":"Name","value":"index"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"block"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"hash"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"btcTransaction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"txid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"txidOrTxHash"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"blockHeight"}},{"kind":"Field","name":{"kind":"Name","value":"blockHash"}},{"kind":"Field","name":{"kind":"Name","value":"txid"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"block"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"fee"}},{"kind":"Field","name":{"kind":"Name","value":"feeRate"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed"}},{"kind":"Field","name":{"kind":"Name","value":"confirmations"}},{"kind":"Field","name":{"kind":"Name","value":"vin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"txid"}},{"kind":"Field","name":{"kind":"Name","value":"vout"}},{"kind":"Field","name":{"kind":"Name","value":"scriptsig"}},{"kind":"Field","name":{"kind":"Name","value":"scriptsigAsm"}},{"kind":"Field","name":{"kind":"Name","value":"isCoinbase"}},{"kind":"Field","name":{"kind":"Name","value":"sequence"}},{"kind":"Field","name":{"kind":"Name","value":"prevout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"txid"}},{"kind":"Field","name":{"kind":"Name","value":"vout"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkey"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyAsm"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyType"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyAddress"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"satoshi"}},{"kind":"Field","name":{"kind":"Name","value":"pendingSatoshi"}},{"kind":"Field","name":{"kind":"Name","value":"transactionsCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spent"}},{"kind":"Field","name":{"kind":"Name","value":"txid"}},{"kind":"Field","name":{"kind":"Name","value":"vin"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"vout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"txid"}},{"kind":"Field","name":{"kind":"Name","value":"vout"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkey"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyAsm"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyType"}},{"kind":"Field","name":{"kind":"Name","value":"scriptpubkeyAddress"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"satoshi"}},{"kind":"Field","name":{"kind":"Name","value":"pendingSatoshi"}},{"kind":"Field","name":{"kind":"Name","value":"transactionsCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spent"}},{"kind":"Field","name":{"kind":"Name","value":"txid"}},{"kind":"Field","name":{"kind":"Name","value":"vin"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"ckbTransaction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"txHash"},"value":{"kind":"Variable","name":{"kind":"Name","value":"txidOrTxHash"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isCellbase"}},{"kind":"Field","name":{"kind":"Name","value":"blockNumber"}},{"kind":"Field","name":{"kind":"Name","value":"hash"}},{"kind":"Field","name":{"kind":"Name","value":"fee"}},{"kind":"Field","name":{"kind":"Name","value":"feeRate"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed"}},{"kind":"Field","name":{"kind":"Name","value":"confirmations"}},{"kind":"Field","name":{"kind":"Name","value":"outputs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"txHash"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"cellType"}},{"kind":"Field","name":{"kind":"Name","value":"type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codeHash"}},{"kind":"Field","name":{"kind":"Name","value":"hashType"}},{"kind":"Field","name":{"kind":"Name","value":"args"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codeHash"}},{"kind":"Field","name":{"kind":"Name","value":"hashType"}},{"kind":"Field","name":{"kind":"Name","value":"args"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"consumed"}},{"kind":"Field","name":{"kind":"Name","value":"txHash"}},{"kind":"Field","name":{"kind":"Name","value":"index"}}]}},{"kind":"Field","name":{"kind":"Name","value":"xudtInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"decimal"}},{"kind":"Field","name":{"kind":"Name","value":"typeHash"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"inputs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"txHash"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"cellType"}},{"kind":"Field","name":{"kind":"Name","value":"type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codeHash"}},{"kind":"Field","name":{"kind":"Name","value":"hashType"}},{"kind":"Field","name":{"kind":"Name","value":"args"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codeHash"}},{"kind":"Field","name":{"kind":"Name","value":"hashType"}},{"kind":"Field","name":{"kind":"Name","value":"args"}}]}},{"kind":"Field","name":{"kind":"Name","value":"xudtInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"decimal"}},{"kind":"Field","name":{"kind":"Name","value":"typeHash"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"consumed"}},{"kind":"Field","name":{"kind":"Name","value":"txHash"}},{"kind":"Field","name":{"kind":"Name","value":"index"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"block"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"hash"}}]}}]}}]}}]} as unknown as DocumentNode<RgbppTransactionQuery, RgbppTransactionQueryVariables>;
export const RgbppStatisticDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RgbppStatistic"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rgbppStatistic"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactionsCount"}},{"kind":"Field","name":{"kind":"Name","value":"holdersCount"}}]}}]}}]} as unknown as DocumentNode<RgbppStatisticQuery, RgbppStatisticQueryVariables>;
export const CkbAndBtcChainInfoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CkbAndBtcChainInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ckbChainInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tipBlockNumber"}}]}},{"kind":"Field","name":{"kind":"Name","value":"btcChainInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tipBlockHeight"}},{"kind":"Field","name":{"kind":"Name","value":"transactionsCountIn24Hours"}}]}}]}}]} as unknown as DocumentNode<CkbAndBtcChainInfoQuery, CkbAndBtcChainInfoQueryVariables>;
export const SearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Search"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"query"}},{"kind":"Field","name":{"kind":"Name","value":"btcBlock"}},{"kind":"Field","name":{"kind":"Name","value":"btcTransaction"}},{"kind":"Field","name":{"kind":"Name","value":"btcAddress"}},{"kind":"Field","name":{"kind":"Name","value":"ckbBlock"}},{"kind":"Field","name":{"kind":"Name","value":"ckbTransaction"}},{"kind":"Field","name":{"kind":"Name","value":"ckbAddress"}},{"kind":"Field","name":{"kind":"Name","value":"rgbppCoin"}}]}}]}}]} as unknown as DocumentNode<SearchQuery, SearchQueryVariables>;
export const BtcAndCkbChainInfoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BtcAndCkbChainInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ckbChainInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tipBlockNumber"}}]}},{"kind":"Field","name":{"kind":"Name","value":"btcChainInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tipBlockHeight"}},{"kind":"Field","name":{"kind":"Name","value":"transactionsCountIn24Hours"}}]}}]}}]} as unknown as DocumentNode<BtcAndCkbChainInfoQuery, BtcAndCkbChainInfoQueryVariables>;