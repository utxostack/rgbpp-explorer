export interface CellDep {
  dep_type: string;
  out_point: {
    index: string;
    tx_hash: string;
  };
}

export interface Input {
  previous_output: {
    index: string;
    tx_hash: string;
  };
  since: string;
}

export interface Script {
  args: string;
  code_hash: string;
  hash_type: string;
}

export interface Output {
  capacity: string;
  lock: Script;
  type: Script | null;
}

export interface Transaction {
  cell_deps: CellDep[];
  hash: string;
  header_deps: string[];
  inputs: Input[];
  outputs: Output[];
  outputs_data: string[];
  version: string;
  witnesses: string[];
}

export interface TransactionWithStatusResponse {
  cycles: string;
  fee: string | null;
  min_replace_fee: string | null;
  time_added_to_pool: string | null;
  transaction: Transaction;
  tx_status: {
    block_hash: string | null;
    block_number: string | null;
    reason: string | null;
    status: string;
  };
}

export interface Block {
  header: {
    compact_target: string;
    dao: string;
    epoch: string;
    extra_hash: string;
    hash: string;
    nonce: string;
    number: string;
    parent_hash: string;
    proposals_hash: string;
    timestamp: string;
    transactions_root: string;
    version: string;
  };
  proposals: string[];
  transactions: Transaction[];
  uncles: string[];
}

export interface BlockEconomicState {
  finalized_at: string;
  issuance: {
    primary: string;
    secondary: string;
  };
  miner_reward: {
    committed: string;
    primary: string;
    proposal: string;
    secondary: string;
  };
  txs_fee: string;
}

export interface SearchKey {
  script: {
    code_hash: string;
    hash_type: 'data' | 'type' | 'data1' | 'data2';
    args: string;
  };
  script_type: 'lock' | 'type';
}

export interface IndexerCell {
  block_number: string;
  io_index: string;
  io_type: string;
  tx_hash: string;
  tx_index: string;
}

export interface GetTransactionsResult {
  last_cursor: string;
  objects: IndexerCell[];
}

export interface Cell {
  block_number: string;
  out_point: {
    index: string;
    tx_hash: string;
  };
  output: Output;
  output_data: string;
  tx_index: string;
}

export interface GetCellsResult {
  last_cursor: string;
  objects: Cell[];
}
