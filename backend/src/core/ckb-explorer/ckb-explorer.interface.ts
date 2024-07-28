import { CellDep, Script } from '../ckb-rpc/ckb-rpc.interface';

export enum BlockSortType {
  HeightAsc = 'height.asc',
  HeightDesc = 'height.desc',
  TransactionsAsc = 'transactions.asc',
  TransactionsDesc = 'transactions.desc',
  RewardAsc = 'reward.asc',
  RewardDesc = 'reward.desc',
}

export enum TransactionSortType {
  NumberAsc = 'number.asc',
  NumberDesc = 'number.desc',
  TimeAsc = 'time.asc',
  TimeDesc = 'time.desc',
}

export enum AddressTransactionSortType {
  TimeAsc = 'time.asc',
  TimeDesc = 'time.desc',
}

// https://github.com/nervosnetwork/ckb-explorer/blob/f2b9823e1a1ece1b74901ca3090565d62b251dcd/app/workers/bitcoin_transaction_detect_worker.rb#L123C4-L137C8
export enum LeapDirection {
  In = 'in',
  LeapOutBtc = 'leapoutBTC',
  WithinBtc = 'withinBTC',
}

export enum TransferStep {
  Isomorphic = 'isomorphic',
  Unlock = 'unlock',
}

export interface PaginationMeta {
  total: number;
  page_size: number;
}

export interface CkbExplorerResponse<T, IsPaginated extends boolean = false> {
  data: T;
  meta: IsPaginated extends true ? PaginationMeta : never;
}

export type NonPaginatedResponse<T extends {}> = CkbExplorerResponse<
  {
    id: string;
    type: string;
    attributes: T;
  },
  false
>;

export type PaginatedResponse<T extends {}> = CkbExplorerResponse<
  {
    id: string;
    type: string;
    attributes: T;
  }[],
  true
>;

export interface BlockList {
  miner_hash: string;
  number: string;
  timestamp: string;
  reward: string;
  transactions_count: string;
  live_cell_changes: string;
}

export interface Block {
  block_hash: string;
  uncle_block_hashes: string;
  miner_hash: string;
  transactions_root: string;
  reward_status: string;
  received_tx_fee_status: string;
  miner_message: string;
  number: string;
  start_number: string;
  length: string;
  version: string;
  proposals_count: string;
  uncles_count: string;
  timestamp: string;
  reward: string;
  cell_consumed: string;
  total_transaction_fee: string;
  transactions_count: string;
  total_cell_capacity: string;
  received_tx_fee: string;
  epoch: string;
  block_index_in_epoch: string;
  nonce: string;
  difficulty: string;
  miner_reward: string;
  size: number;
  largest_block_in_epoch: number;
  largest_block: number;
  cycles: number;
  max_cycles_in_epoch: number;
  max_cycles: number;
}

export interface DisplayInput {
  id: string;
  from_cellbase: boolean;
  capacity: string;
  occupied_capacity: string;
  address_hash: string;
  generated_tx_hash: string;
  target_block_number?: string;

  // XUDT
  cell_type: string;
  xudt_info: {
    symbol: string;
    amount: string;
    decimal: string;
    type_hash: string;
    published: boolean;
  };
}

export interface DisplayOutput {
  id: string;
  capacity: string;
  occupied_capacity: string;
  address_hash: string;
  target_block_number: string;
  base_reward: string;
  commit_reward: string;
  proposal_reward: string;
  secondary_reward: string;
  status: 'live' | 'dead';
  consumed_tx_hash: string;
  generated_tx_hash: string;
  cell_index: string;

  // XUDT
  cell_type: string;
  xudt_info: {
    symbol: string;
    amount: string;
    decimal: string;
    type_hash: string;
    published: boolean;
  };
}

export interface Transaction {
  is_cellbase: boolean;
  transaction_hash: string;
  block_number: string;
  block_timestamp: string;
  display_inputs_count: number;
  display_outputs_count: number;
  display_inputs: DisplayInput[];
  display_outputs: DisplayOutput[];
  income: string;
  is_rgb_transaction: boolean;
  is_btc_time_lock: boolean;
  rgb_txid: string;
  rgb_transfer_step: null;
  created_at: string;
  create_timestamp: string;
}

export interface DetailTransaction extends Transaction {
  version: string;
  cell_deps: CellDep[];
  witnesses: string[];
  transaction_fee: string;
  bytes: number;
  largest_tx_in_epoch: number;
  largest_tx: number;
  cycles: number;
  max_cycles_in_epoch: number;
  max_cycles: number;
  // TODO: replace with actual literal status, e.g. "committed"
  tx_status: string;
}

export interface RgbppTransaction {
  id: number;
  tx_hash: string;
  block_id: number;
  block_number: number;
  block_timestamp: number;
  leap_direction: LeapDirection;
  transfer_step: TransferStep;
  rgb_cell_changes: number;
  rgb_txid: string;
}

export enum XUDTTag {
  RgbppCompatible = 'rgbpp-compatible',
  Layer1Asset = 'layer-1-asset',
  Layer2Asset = 'layer-2-asset',
  SupplyLimited = 'supply-limited',
  SupplyUnlimited = 'supply-unlimited',
  Suspicious = 'suspicious',
  Invalid = 'invalid',
}

export interface XUDT {
  symbol: string;
  full_name: string;
  icon_file: string | null;
  published: boolean;
  description: string | null;
  type_hash: string;
  type_script: {
    args: string;
    code_hash: string;
    hash_type: string;
  };
  issuer_address: string;
  udt_type: string;
  operator_website: string | null;
  email: string | null;
  total_amount: string;
  addresses_count: string;
  decimal: string;
  h24_ckb_transactions_count: string;
  created_at: string;
  xudt_tags: XUDTTag[];
}

// https://github.com/nervosnetwork/ckb-explorer-frontend/blob/develop/src/models/Address/index.ts
export interface LockInfo {
  status: 'locked' | 'unlocked';
  epoch_number: string;
  epoch_index: string;
  estimated_unlock_time: string;
}
export enum AddressType {
  Address = 'Address',
  LockHash = 'LockHash',
  Unknown = 'Unknown',
}
export interface AddressInfo {
  addressHash: string;
  bitcoin_address_hash?: string;
  lockHash: string;
  balance: string;
  balanceOccupied: string;
  transactions_count: string;
  lock_script: Script;
  pending_reward_blocks_count: string;
  type: AddressType;
  dao_deposit: string;
  interest: string;
  dao_compensation: string;
  lock_info: LockInfo;
  live_cells_count: string;
  mined_blocks_count: string;
  is_special: boolean;
  special_address: string;
  // TODO: describe this type
  udt_accounts?: unknown[];
}

// https://github.com/nervosnetwork/ckb-explorer-frontend/blob/develop/src/services/ExplorerService/types.ts#L331-L337
export interface RgbppDigest {
  txid: string;
  commitment: string;
  confirmations: number;
  leap_direction: LeapDirection | null;
  transfer_step: TransferStep | null;
  // TODO: describe this type
  transfers: unknown[];
}

// https://github.com/nervosnetwork/ckb-explorer-frontend/blob/develop/src/services/ExplorerService/fetcher.ts#L376-L390
export interface Statistics {
  tip_block_number: string;
  average_block_time: string;
  current_epoch_difficulty: string;
  hash_rate: string;
  epoch_info: {
    epoch_number: string;
    epoch_length: string;
    index: string;
  };
  estimated_epoch_time: string;
  transactions_last_24hrs: string;
  transactions_count_per_minute: string;
  reorg_started_at: string | null;
}

// https://github.com/nervosnetwork/ckb-explorer-frontend/blob/develop/src/services/ExplorerService/fetcher.ts#L1178-L1199
export interface TransactionFeesStatistic {
  transaction_fee_rates: TransactionFeeRate[];
  pending_transaction_fee_rates: PendingTransactionFeeRate[];
  last_n_days_transaction_fee_rates: LastNDaysTransactionFeeRate[];
}
export interface TransactionFeeRate {
  id: number;
  timestamp: number;
  fee_rate: number;
  confirmation_time: number;
}
export interface PendingTransactionFeeRate {
  id: number;
  fee_rate: number;
}
export interface LastNDaysTransactionFeeRate {
  date: string;
  feeRate: string;
}
