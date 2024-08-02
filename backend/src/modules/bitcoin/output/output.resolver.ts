import { Loader } from '@applifting-io/nestjs-dataloader';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { BitcoinAddress, BitcoinBaseAddress } from '../address/address.model';
import { BitcoinBaseOutput, BitcoinOutput, BitcoinOutputStatus } from './output.model';
import {
  BitcoinTransactionOutSpendsLoader,
  BitcoinTransactionOutSpendsLoaderType,
} from '../transaction/transaction.dataloader';

@Resolver(() => BitcoinOutput)
export class BitcoinOutputResolver {
  @ResolveField(() => BitcoinAddress, { nullable: true })
  public async address(@Parent() output: BitcoinBaseOutput): Promise<BitcoinBaseAddress | null> {
    // XXX: OP_RETURN outputs don't have address
    if (!output.scriptpubkeyAddress) {
      return null;
    }
    return {
      address: output.scriptpubkeyAddress,
    };
  }

  @ResolveField(() => BitcoinOutputStatus, { nullable: true })
  public async status(
    @Parent() output: BitcoinBaseOutput,
    @Loader(BitcoinTransactionOutSpendsLoader)
    outSpendsLoader: BitcoinTransactionOutSpendsLoaderType,
  ): Promise<BitcoinOutputStatus | null> {
    const outSpends = await outSpendsLoader.load(output.txid);
    if (!outSpends || !outSpends[output.vout]) {
      return null;
    }
    const outSpend = outSpends[output.vout];
    return BitcoinOutputStatus.from(outSpend);
  }
}
