import { Args, Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CkbExplorerService } from 'src/core/ckb-explorer/ckb-explorer.service';
import { RgbppAddress, RgbppBaseAddress } from './address.model';

@Resolver(() => RgbppAddress)
export class RgbppAddressResolver {
  constructor(private ckbExplorerService: CkbExplorerService) {}

  @Query(() => RgbppAddress, { name: 'rgbppAddress', nullable: true })
  public async getBtcAddress(@Args('address') address: string): Promise<RgbppBaseAddress> {
    return RgbppAddress.from(address);
  }

  @ResolveField(() => Float)
  public async utxosCount(@Parent() address: RgbppBaseAddress): Promise<number> {
    const cells = await this.ckbExplorerService.getAddressRgbppCells({
      address: address.address,
    });
    return cells.meta.total;
  }

  @ResolveField(() => Float)
  public async cellsCount(@Parent() address: RgbppBaseAddress): Promise<number> {
    // TODO: implement this resolver
    // XXX: how to relate ckb address with rgbpp cells? (except the address is rgbpp-lock/btc-time-lock)
    return 0;
  }
}
