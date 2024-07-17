export interface PaginationMeta {
  total: number;
  page_size: number;
}

export interface CkbExplorerResponse<T extends {}, IsPaginated extends boolean = false> {
  data: IsPaginated extends true
  ? {
    id: string;
    type: string;
    attributes: T;
  }[]
  : {
    id: string;
    type: string;
    attributes: T;
  };
  meta: IsPaginated extends true ? PaginationMeta : never;
}

export type NonPaginatedResponse<T extends {}> = CkbExplorerResponse<T, false>;

export type PaginatedResponse<T extends {}> = CkbExplorerResponse<T, true>;

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
  target_block_number: string;
  generated_tx_hash: string;
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
  status: string;
  consumed_tx_hash: string;
  generated_tx_hash: string;
  cell_index: string;
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
