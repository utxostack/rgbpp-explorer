import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { BitcoinOutput } from 'src/modules/bitcoin/output/output.model';
import { RgbppAsset } from './asset.model';
import {
  BitcoinTransactionLoader,
  BitcoinTransactionLoaderType,
} from 'src/modules/bitcoin/transaction/transaction.dataloader';
import { Loader } from '@applifting-io/nestjs-dataloader';
import { RgbppCoreService } from 'src/core/rgbpp/rgbpp.service';

@Resolver(() => RgbppAsset)
export class RgbppAssetResolver {
  constructor(private rgbppCoreService: RgbppCoreService) { }

  @ResolveField(() => BitcoinOutput, { nullable: true })
  public async utxo(
    @Parent() asset: RgbppAsset,
    @Loader(BitcoinTransactionLoader) txLoader: BitcoinTransactionLoaderType,
  ): Promise<BitcoinOutput | null> {
    try {
      const { args } = asset.cell.lock;
      const { btcTxid, outIndex } = this.rgbppCoreService.parseRgbppLockArgs(args);
      const tx = await txLoader.load(btcTxid);
      if (!tx) {
        return null;
      }
      const output = tx.vout[outIndex];
      return BitcoinOutput.from({
        txid: btcTxid,
        vout: outIndex,
        ...output,
      });
    } catch {
      return null;
    }
  }
}
