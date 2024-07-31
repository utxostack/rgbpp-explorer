import { Injectable } from '@nestjs/common';
import { Parent, ResolveField } from '@nestjs/graphql';
import { BitcoinBaseOutput, BitcoinOutput } from 'src/modules/bitcoin/output/output.model';
import { RgbppBaseAsset } from './asset.model';
import {
  BitcoinTransactionLoader,
  BitcoinTransactionLoaderType,
} from 'src/modules/bitcoin/transaction/transaction.dataloader';
import { RgbppService } from '../rgbpp.service';
import { Loader } from '@applifting-io/nestjs-dataloader';

@Injectable()
export class AssetResolver {
  constructor(private rgbppService: RgbppService) {}

  @ResolveField(() => BitcoinOutput, { nullable: true })
  public async utxo(
    @Parent() asset: RgbppBaseAsset,
    @Loader(BitcoinTransactionLoader) txLoader: BitcoinTransactionLoaderType,
  ): Promise<BitcoinBaseOutput> {
    try {
      const { args } = asset.cell.lock;
      const { btcTxid, outIndex } = this.rgbppService.parseRgbppLockArgs(args);
      const tx = await txLoader.load(btcTxid);
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
