import { Query, Resolver } from '@nestjs/graphql';
import { CkbChainInfo } from './ckb.model';
import { CkbRpcWebsocketService } from 'src/core/ckb-rpc/ckb-rpc-websocket.service';

@Resolver(() => CkbChainInfo)
export class CkbResolver {
  constructor(private ckbRpcService: CkbRpcWebsocketService) {}

  @Query(() => CkbChainInfo)
  public async getCkbChainInfo(): Promise<CkbChainInfo> {
    const tipBlockNumber = await this.ckbRpcService.getTipBlockNumber();
    return {
      tipBlockNumber,
    };
  }
}
