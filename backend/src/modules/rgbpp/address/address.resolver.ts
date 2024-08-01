import { Args, Float, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import { RgbppAddress, RgbppBaseAddress } from './address.model';
import { RgbppAddressService } from './address.service';
import { ParentField } from 'src/decorators/parent-field.decorator';
import { RgbppAsset, RgbppBaseAsset } from '../asset/asset.model';
import { CkbXUDTInfo } from 'src/modules/ckb/cell/cell.model';
import * as pLimit from 'p-limit';
import { Loader } from '@applifting-io/nestjs-dataloader';
import {
  CkbExplorerTransactionLoader,
  CkbExplorerTransactionLoaderType,
} from 'src/modules/ckb/transaction/transaction.dataloader';
import { BI } from '@ckb-lumos/bi';
import { computeScriptHash } from '@ckb-lumos/lumos/utils';
import { HashType, Script } from '@ckb-lumos/lumos';

@Resolver(() => RgbppAddress)
export class RgbppAddressResolver {
  constructor(
    private ckbExplorerService: CkbExplorerService,
    private rgbppAddressService: RgbppAddressService,
  ) {}

  @Query(() => RgbppAddress, { name: 'rgbppAddress', nullable: true })
  public async getBtcAddress(@Args('address') address: string): Promise<RgbppBaseAddress> {
    return RgbppAddress.from(address);
  }

  @ResolveField(() => Float)
  public async utxosCount(@ParentField('address') address: string): Promise<number> {
    const cells = await this.ckbExplorerService.getAddressRgbppCells({
      address,
    });
    return cells.meta.total;
  }

  @ResolveField(() => Float)
  public async cellsCount(@ParentField('address') address: string): Promise<number> {
    const cells = await this.rgbppAddressService.getRgbppAddressCells(address);
    return cells.length;
  }

  @ResolveField(() => [RgbppAsset])
  public async assets(@ParentField('address') address: string): Promise<RgbppBaseAsset[]> {
    const cells = await this.rgbppAddressService.getRgbppAddressCells(address);
    return cells.map((cell) => RgbppAsset.from(address, cell));
  }

  @ResolveField(() => [Float])
  public async balances(
    @ParentField('address') address: string,
    @Loader(CkbExplorerTransactionLoader) explorerTxLoader: CkbExplorerTransactionLoaderType,
  ): Promise<(CkbXUDTInfo | null)[]> {
    const cells = await this.rgbppAddressService.getRgbppAddressCells(address);
    const limit = pLimit(10);
    const xudts = await Promise.all(
      cells.map((cell) =>
        limit(async () => {
          const tx = await explorerTxLoader.load(cell.out_point.tx_hash);
          if (!tx) {
            return null;
          }
          const output = tx.display_outputs[BI.from(cell.out_point.index).toNumber()];
          const info = output.xudt_info || output.omiga_inscription_info;
          if (!info) {
            return null;
          }
          const typeScript: Script = {
            codeHash: cell.output.type!.code_hash,
            hashType: cell.output.type!.hash_type as HashType,
            args: cell.output.type!.args,
          };
          const xudt: CkbXUDTInfo = {
            typeHash: computeScriptHash(typeScript),
            symbol: info.symbol,
            amount: BI.from(info.amount).toHexString(),
            decimal: BI.from(info.decimal).toNumber(),
          };
          return xudt;
        }),
      ),
    );
    const balancesMap = new Map<string, CkbXUDTInfo>();
    xudts.forEach((xudt) => {
      if (!xudt) {
        return;
      }
      const key = xudt.typeHash;
      if (!balancesMap.has(key)) {
        balancesMap.set(key, xudt);
      } else {
        const amount = BI.from(balancesMap.get(key).amount).add(BI.from(xudt.amount)).toHexString();
        balancesMap.set(key, {
          ...balancesMap.get(key),
          amount,
        });
      }
    });
    return Array.from(balancesMap.values());
  }
}
