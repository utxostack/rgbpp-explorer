import { Loader } from 'src/common/dataloader';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { BitcoinAddress } from '../address/address.model';
import { BitcoinOutput, BitcoinOutputStatus } from './output.model';
import {
  BitcoinTransactionOutSpendsLoader,
  BitcoinTransactionOutSpendsLoaderType,
} from '../transaction/transaction.dataloader';
import { ComplexityType } from 'src/modules/complexity.plugin';

@Resolver(() => BitcoinOutput)
export class BitcoinOutputResolver {
  @ResolveField(() => BitcoinAddress, { nullable: true })
  public async address(@Parent() output: BitcoinOutput): Promise<BitcoinAddress | null> {
    // XXX: OP_RETURN outputs don't have address
    if (!output.scriptpubkeyAddress) {
      return null;
    }
    return {
      address: output.scriptpubkeyAddress,
    };
  }

  @ResolveField(() => BitcoinOutputStatus, {
    nullable: true,
    complexity: ComplexityType.RequestField,
  })
  public async status(
    @Parent() output: BitcoinOutput,
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
