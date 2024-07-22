import { Resolver } from '@nestjs/graphql';
import { BitcoinInput } from './input.model';

@Resolver(() => BitcoinInput)
export class BitcoinInputResolver {}
