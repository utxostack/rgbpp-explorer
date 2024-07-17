import { Resolver } from '@nestjs/graphql';
import { CkbCell } from './cell.model';

@Resolver(() => CkbCell)
export class CellResolver {}
