import { Address, Block, RecommendedFees, Transaction, UTXO } from './bitcoin-api.schema';

export interface IBitcoinDataProvider {
  getFeesRecommended(): Promise<RecommendedFees>;
  getAddress(props: { address: string }): Promise<Address>;
  getAddressTxsUtxo(props: { address: string }): Promise<UTXO[]>;
  getAddressTxs(props: { address: string; afterTxid?: string }): Promise<Transaction[]>;
  getTx(props: { txid: string }): Promise<Transaction>;
  getTxHex(props: { txid: string }): Promise<string>;
  getBlock(props: { hash: string }): Promise<Block>;
  getBlockTxs(props: { hash: string; startIndex: number }): Promise<Transaction[]>;
  getBlockHeight(props: { height: number }): Promise<string>;
  getBlockHeader(props: { hash: string }): Promise<string>;
  getBlockTxids(props: { hash: string }): Promise<string[]>;
  getBlocksTipHash(): Promise<string>;
}
