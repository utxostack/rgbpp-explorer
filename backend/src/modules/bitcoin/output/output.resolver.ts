import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { BitcoinAddress, BitcoinBaseAddress } from '../address/address.model';
import { BitcoinOutput } from './output.model';

@Resolver(() => BitcoinOutput)
export class BitcoinOutputResolver {
  @ResolveField(() => BitcoinAddress)
  public async address(@Parent() output: BitcoinOutput): Promise<BitcoinBaseAddress> {
    // TODO: Implement this resolver
    return {
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    };
  }
}
