import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { BitcoinAddress, BitcoinBaseAddress } from '../address/address.model';
import { BitcoinOutput } from './output.model';

@Resolver(() => BitcoinOutput)
export class BitcoinOutputResolver {
  @ResolveField(() => BitcoinAddress)
  public async address(@Parent() output: BitcoinOutput): Promise<BitcoinBaseAddress | null> {
    // XXX: OP_RETURN outputs don't have address
    if (!output.scriptpubkeyAddress) {
      return null;
    }
    return {
      address: output.scriptpubkeyAddress,
    };
  }

  @ResolveField(() => Boolean)
  public async spent(@Parent() output: BitcoinOutput): Promise<boolean> {
    // TODO: implement this resolver
    return false;
  }
}
