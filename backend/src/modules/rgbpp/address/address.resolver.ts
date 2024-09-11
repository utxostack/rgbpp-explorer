import { Args, Float, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import { RgbppAddress } from './address.model';
import { ParentField } from 'src/decorators/parent-field.decorator';
import { RgbppAsset } from '../asset/asset.model';
import { CkbXUDTInfo } from 'src/modules/ckb/cell/cell.model';
import { RgbppAddressService } from './address.service';

@Resolver(() => RgbppAddress)
export class RgbppAddressResolver {
  constructor(
    private ckbExplorerService: CkbExplorerService,
    private rgbppAddressService: RgbppAddressService,
  ) {}

  @Query(() => RgbppAddress, { name: 'rgbppAddress', nullable: true })
  public async getBtcAddress(@Args('address') address: string): Promise<RgbppAddress> {
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
    // TODO: implement this
    return 0;
  }

  @ResolveField(() => [RgbppAsset])
  public async assets(@ParentField('address') address: string): Promise<RgbppAsset[]> {
    return [];
  }

  @ResolveField(() => [CkbXUDTInfo])
  public async balances(@ParentField('address') address: string): Promise<(CkbXUDTInfo | null)[]> {
    const balances = await this.rgbppAddressService.getAddressBalances(address);
    return balances;
  }
}
