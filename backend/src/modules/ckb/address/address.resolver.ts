import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { helpers, config } from '@ckb-lumos/lumos';
import { Loader } from '@applifting-io/nestjs-dataloader';
import { Args, Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Env } from 'src/env';
import { NetworkType } from 'src/constants';
import { CkbBaseTransaction, CkbTransaction } from '../transaction/transaction.model';
import { CkbAddress, CkbBaseAddress } from './address.model';
import {
  CkbAddressLoader,
  CkbAddressLoaderType,
  CkbAddressTransactionsLoader,
  CkbAddressTransactionsLoaderType,
} from './address.dataloader';
import {
  CkbRpcTransactionLoader,
  CkbRpcTransactionLoaderType,
} from '../transaction/transaction.dataloader';

@Resolver(() => CkbAddress)
export class CkbAddressResolver {
  private logger = new Logger(CkbAddressResolver.name);
  constructor(private configService: ConfigService<Env>) {}

  @Query(() => CkbAddress, { name: 'ckbAddress', nullable: true })
  public async getCkbAddress(@Args('address') address: string): Promise<CkbBaseAddress> {
    try {
      const network = this.configService.get('NETWORK');
      const lumosConfig = network === NetworkType.mainnet ? config.MAINNET : config.TESTNET;
      helpers.parseAddress(address, { config: lumosConfig });
      return {
        address,
      };
    } catch (e) {
      throw new Error('Invalid CKB address');
    }
  }

  @ResolveField(() => Float)
  public async shannon(
    @Parent() address: CkbBaseAddress,
    @Loader(CkbAddressLoader) addressLoader: CkbAddressLoaderType,
  ): Promise<number> {
    const [info] = await addressLoader.load({ address: address.address });
    return Number(info.balance);
  }

  @ResolveField(() => Float)
  public async transactionsCount(
    @Parent() address: CkbBaseAddress,
    @Loader(CkbAddressLoader) addressLoader: CkbAddressLoaderType,
  ): Promise<number> {
    const [info] = await addressLoader.load({ address: address.address });
    return Number(info.transactions_count);
  }

  @ResolveField(() => [CkbTransaction])
  public async transactions(
    @Parent() address: CkbBaseAddress,
    @Loader(CkbAddressTransactionsLoader) addressTxsLoader: CkbAddressTransactionsLoaderType,
    @Loader(CkbRpcTransactionLoader) rpcTxLoader: CkbRpcTransactionLoaderType,
    @Args('page', { nullable: true }) page?: number,
    @Args('pageSize', { nullable: true }) pageSize?: number,
  ): Promise<CkbBaseTransaction[]> {
    const res = await addressTxsLoader.load({
      address: address.address,
      pageSize,
      page,
    });
    return Promise.all(
      res.txs.map(async (tx) => {
        const rpcTx = await rpcTxLoader.load(tx.transaction_hash);
        return CkbTransaction.from(rpcTx);
      }),
    );
  }
}
