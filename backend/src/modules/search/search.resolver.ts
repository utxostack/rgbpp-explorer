import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { SearchResult } from './search.model';
import { Loader } from 'src/common/dataloader';
import {
  BitcoinBlockLoader,
  BitcoinBlockLoaderType,
} from '../bitcoin/block/dataloader/block.dataloader';
import {
  BitcoinTransactionLoader,
  BitcoinTransactionLoaderType,
} from '../bitcoin/transaction/transaction.dataloader';
import { CkbRpcBlockLoader, CkbRpcBlockLoaderType } from '../ckb/block/block.dataloader';
import {
  CkbRpcTransactionLoader,
  CkbRpcTransactionLoaderType,
} from '../ckb/transaction/transaction.dataloader';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import {
  TryValidateBtcAddressPipe,
  TryValidateCkbAddressPipe,
} from 'src/pipes/validate-address.pipe';
import { ParentField } from 'src/decorators/parent-field.decorator';

@Resolver(() => SearchResult)
export class SearchResolver {
  constructor(private ckbExplorerService: CkbExplorerService) {}

  @Query(() => SearchResult)
  public async search(@Args('query') query: string) {
    return {
      query,
    };
  }

  @ResolveField(() => String, { nullable: true })
  public async btcBlock(
    @Parent() { query }: SearchResult,
    @Loader(BitcoinBlockLoader) blockLoader: BitcoinBlockLoaderType,
  ): Promise<string | null> {
    // TODO: check if query is a block hash or block height
    const block = await blockLoader.load(query);
    return block ? block.id : null;
  }

  @ResolveField(() => String, { nullable: true })
  public async btcTransaction(
    @Parent() { query }: SearchResult,
    @Loader(BitcoinTransactionLoader) txLoader: BitcoinTransactionLoaderType,
  ): Promise<string | null> {
    const transaction = await txLoader.load(query);
    return transaction ? transaction.txid : null;
  }

  @ResolveField(() => String, { nullable: true })
  public async btcAddress(
    @ParentField('query', TryValidateBtcAddressPipe) address: string | null,
  ): Promise<string | null> {
    return address;
  }

  @ResolveField(() => String, { nullable: true })
  public async ckbBlock(
    @Parent() { query }: SearchResult,
    @Loader(CkbRpcBlockLoader) rpcBlockLoader: CkbRpcBlockLoaderType,
  ): Promise<string | null> {
    const block = await rpcBlockLoader.load(query);
    if (!block) {
      return null;
    }
    return block.header?.hash;
  }

  @ResolveField(() => String, { nullable: true })
  public async ckbTransaction(
    @Parent() { query }: SearchResult,
    @Loader(CkbRpcTransactionLoader) rpcTxLoader: CkbRpcTransactionLoaderType,
  ): Promise<string | null> {
    const tx = await rpcTxLoader.load(query);
    if (!tx) {
      return null;
    }
    return tx.transaction?.hash;
  }

  @ResolveField(() => String, { nullable: true })
  public async ckbAddress(
    @ParentField('query', TryValidateCkbAddressPipe) address: string | null,
  ): Promise<string | null> {
    return address;
  }

  @ResolveField(() => String, { nullable: true })
  public async rgbppCoin(@Parent() { query }: SearchResult): Promise<string | null> {
    try {
      const response = await this.ckbExplorerService.getXUDT(query);
      return response.data?.attributes?.type_hash;
    } catch {
      return null;
    }
  }
}
