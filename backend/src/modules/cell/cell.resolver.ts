import { Resolver } from '@nestjs/graphql';
import { Cell } from './cell.model';

@Resolver(() => Cell)
export class CellResolver {
}
