import { Query, Resolver } from '@nestjs/graphql';
import { CkbRpcWebsocketService } from 'src/core/ckb-rpc/ckb-rpc-websocket.service';
import { CkbChainInfo } from './ckb.model';

@Resolver(() => CkbChainInfo)
export class CkbResolver {
  constructor(private ckbRpcService: CkbRpcWebsocketService) {}

  @Query(() => CkbChainInfo, { name: 'ckbChainInfo' })
  public async chainInfo(): Promise<CkbChainInfo> {
    const tipBlockNumber = await this.ckbRpcService.getTipBlockNumber();
    return {
      tipBlockNumber,
    };
  }
}
