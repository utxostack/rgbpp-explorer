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
  status: string;
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

export interface RgbppDigest {
  txid: string;
  commitment: string;
  confirmations: number;
  leap_direction: LeapDirection | null;
  transfer_step: TransferStep | null;
  transfers: TransactionRecord[];
}

export interface TransactionRecord {
  address: string;
  transfers: LiteTransfer.Transfer[];
}

// https://github.com/nervosnetwork/ckb-explorer-frontend/blob/develop/src/services/ExplorerService/types.ts#L303
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace LiteTransfer {
  // Plain CKB Transfer
  export interface CKBTransfer {
    capacity: string;
    cell_type: 'normal';
  }

  // MNFT
  export interface NFTTransfer {
    capacity: string;
    cell_type: 'm_nft_token';
    // FIXME: This is a typo in the api, should be fixed
    toekn_id?: string;
    token_id: string;
    name: string;
    count: string;
  }

  export interface NFTClassTransfer {
    capacity: string;
    cell_type: 'm_nft_class';
  }

  export interface NFTIssuerTransfer {
    capacity: string;
    cell_type: 'm_nft_issuer';
  }
  // NRC 721
  export interface NRC721Transfer {
    capacity: string;
    cell_type: 'nrc_721_token';
    // FIXME: This is a typo in the api, should be fixed
    toekn_id?: string;
    token_id: string;
    name: string;
    count: string;
  }

  export interface NRC721FactoryTransfer {
    capacity: string;
    cell_type: 'nrc_721_factory';
  }

  // Spore
  export interface SporeTransfer {
    capacity: string;
    cell_type: 'spore_cell' | 'did_cell';
    // FIXME: This is a typo in the api, should be fixed
    toekn_id?: string;
    token_id: string;
    name: string;
    count: string;
  }

  export interface SporeClusterTransfer {
    capacity: string;
    cellType: 'spore_cluster';
  }

  // udt
  export interface UDTTransfer {
    capacity: string;
    cellType: 'udt';
    udtInfo: Record<'symbol' | 'decimal' | 'typeHash' | 'amount', string>;
  }

  // Cota
  export interface CotaTransfer {
    capacity: string;
    cell_type: 'cota_regular';
    cota_info: Record<'name' | 'count' | 'tokenId', string>[];
  }

  export interface CotaRegistryTransfer {
    capacity: string;
    cell_type: 'cota_registry';
  }

  export interface OmigaTransfer {
    capacity: string;
    cell_type: 'omiga_inscription';
    name: string;
    count: string;
    udtInfo: Record<'symbol' | 'decimal' | 'typeHash' | 'amount', string>;
  }
  export interface XudtTransfer {
    capacity: string;
    cell_type: 'xudt' | 'xudt_compatible';
    udt_info: Record<'symbol' | 'decimal' | 'typeHash' | 'amount', string>;
  }

  export type Transfer =
    | CKBTransfer
    | NFTTransfer
    | NFTClassTransfer
    | NFTIssuerTransfer
    | NRC721Transfer
    | NRC721FactoryTransfer
    | SporeTransfer
    | SporeClusterTransfer
    | UDTTransfer
    | CotaTransfer
    | CotaRegistryTransfer
    | OmigaTransfer
    | XudtTransfer;
}
