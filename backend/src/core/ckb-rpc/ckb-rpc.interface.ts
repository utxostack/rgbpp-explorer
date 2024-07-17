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

export interface TransactionWithStatusResponse {
  cycles: string;
  fee: string | null;
  min_replace_fee: string | null;
  time_added_to_pool: string | null;
  transaction: {
    cell_deps: CellDep[];
    hash: string;
    header_deps: string[];
    inputs: Input[];
    outputs: Output[];
    outputs_data: string[];
    version: string;
    witnesses: string[];
  };
  tx_status: {
    block_hash: string;
    block_number: string;
    reason: string | null;
    status: string;
  };
}
