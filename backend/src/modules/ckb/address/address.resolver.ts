import { Loader } from '@applifting-io/nestjs-dataloader';
import { Args, Float, Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbTransaction } from '../transaction/transaction.model';
import { CkbAddressBalance, CkbAddress } from './address.model';
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
import { ValidateCkbAddressPipe } from 'src/pipes/validate-address.pipe';
import { BI } from '@ckb-lumos/bi';

@Resolver(() => CkbAddress)
export class CkbAddressResolver {
  @Query(() => CkbAddress, { name: 'ckbAddress', nullable: true })
  public async getCkbAddress(
    @Args('address', ValidateCkbAddressPipe) address: string,
  ): Promise<CkbAddress> {
    return {
      address,
    };
  }

  @ResolveField(() => Float, { nullable: true })
  public async shannon(
    @Parent() address: CkbAddress,
    @Loader(CkbAddressLoader) addressLoader: CkbAddressLoaderType,
  ): Promise<number | null> {
    const addressInfo = await addressLoader.load({ address: address.address });
    if (!addressInfo) {
      return null;
    }
    return Number(addressInfo[0].balance);
  }

  @ResolveField(() => Float, { nullable: true })
  public async transactionsCount(
    @Parent() address: CkbAddress,
    @Loader(CkbAddressLoader) addressLoader: CkbAddressLoaderType,
  ): Promise<number | null> {
    const addressInfo = await addressLoader.load({ address: address.address });
    if (!addressInfo) {
      return null;
    }
    return Number(addressInfo[0].transactions_count);
  }

  @ResolveField(() => [CkbTransaction], { nullable: true })
  public async transactions(
    @Parent() address: CkbAddress,
    @Loader(CkbAddressTransactionsLoader) addressTxsLoader: CkbAddressTransactionsLoaderType,
    @Loader(CkbRpcTransactionLoader) rpcTxLoader: CkbRpcTransactionLoaderType,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('pageSize', { type: () => Int, nullable: true }) pageSize?: number,
  ): Promise<(CkbTransaction | null)[] | null> {
    const res = await addressTxsLoader.load({
      address: address.address,
      pageSize,
      page,
    });
    if (!res) {
      return null;
    }
    return Promise.all(
      res.txs.map(async (tx) => {
        const rpcTx = await rpcTxLoader.load(tx.transaction_hash);
        if (!rpcTx) {
          return null;
        }
        return CkbTransaction.from(rpcTx);
      }),
    );
  }

  @ResolveField(() => CkbAddressBalance, { nullable: true })
  public async balance(
    @Parent() address: CkbAddress,
    @Loader(CkbAddressLoader) addressLoader: CkbAddressLoaderType,
  ): Promise<CkbAddressBalance | null> {
    const addressInfo = await addressLoader.load({ address: address.address });
    if (!addressInfo) {
      return null;
    }
    const { balance, balance_occupied } = addressInfo[0];
    const total = BI.from(balance).toHexString();
    const occupied = BI.from(balance_occupied).toHexString();
    const available = BI.from(balance).sub(balance_occupied).toHexString();
    return {
      total,
      available,
      occupied,
    };
  }
}
