import { Float, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { BitcoinAddress } from './address.model';
import { BitcoinBaseTransaction, BitcoinTransaction } from '../transaction/transaction.model';

@Resolver(() => BitcoinAddress)
export class BitcoinAddressResolver {
  @ResolveField(() => Float)
  public async satoshi(@Parent() address: BitcoinAddress): Promise<number> {
    // TODO: Implement this resolver
    // get satoshi/pendingSatoshi from the address UTXOs
    return 0;
  }

  @ResolveField(() => Float)
  public async pendingSatoshi(@Parent() address: BitcoinAddress): Promise<number> {
    // TODO: Implement this Resolver
    return 0;
  }

  @ResolveField(() => Float)
  public async transactionCount(@Parent() address: BitcoinAddress): Promise<number> {
    // TODO: Implement this resolver
    return 0;
  }

  @ResolveField(() => [BitcoinTransaction])
  public async transactions(@Parent() address: BitcoinAddress): Promise<BitcoinBaseTransaction[]> {
    // TODO: Implement this resolver
    // use dataloaders to fetch transactions
    return [];
  }
}
