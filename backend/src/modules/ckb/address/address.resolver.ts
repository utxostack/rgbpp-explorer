import { Args, Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbTransaction } from '../transaction/transaction.model';
import { CkbAddress } from './address.model';

@Resolver(() => CkbAddress)
export class CkbAddressResolver {
  @Query(() => CkbAddress, { name: 'ckbAddress', nullable: true })
  public async getCkbAddress(@Args('address') address: string): Promise<CkbAddress> {
    // TODO: implement this resolver
    return null;
  }

  @ResolveField(() => Float)
  public async shannon(@Parent() address: CkbAddress): Promise<number> {
    // TODO: implement this resolver
    return 0;
  }

  @ResolveField(() => Float)
  public async transactionCount(@Parent() address: CkbAddress): Promise<number> {
    // TODO: implement this resolver
    return 0;
  }

  @ResolveField(() => [CkbTransaction])
  public async transactions(
    @Parent() address: CkbAddress,
    @Args('page', { nullable: true }) page?: number,
    @Args('pageSize', { nullable: true }) pageSize?: number,
  ): Promise<CkbTransaction[]> {
    // TODO: implement this resolver
    return [];
  }
}
