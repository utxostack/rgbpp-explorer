import { Resolver } from '@nestjs/graphql';
import { CkbScript } from './script.model';

@Resolver(() => CkbScript)
export class CkbScriptResolver {}
