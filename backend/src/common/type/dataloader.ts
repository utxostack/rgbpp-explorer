import { NestDataLoader } from '@applifting-io/nestjs-dataloader';

export type DataLoaderResponse<T extends NestDataLoader<unknown, unknown>> =
  Awaited<ReturnType<ReturnType<T['getBatchFunction']>>> extends (infer E)[] ? E : never;
