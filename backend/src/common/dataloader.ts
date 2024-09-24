// https://github.com/Applifting/nestjs-dataloader/blob/5d05f7b027e49dfceb08ee2df264d64d924feaf3/index.ts

import {
  CallHandler,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
  Type,
} from '@nestjs/common';
import { APP_INTERCEPTOR, ModuleRef, ContextIdFactory } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import DataLoader from 'dataloader';
import { Observable } from 'rxjs';

/**
 * This interface will be used to generate the initial data loader.
 * The concrete implementation should be added as a provider to your module.
 */
export interface BaseNestDataLoader<ID, Type> {
  /**
   * Should return a new instance of dataloader each time
   */
  getBatchFunction(): (keys: ID[]) => PromiseLike<Type[]>;
  /**
   * Should return options for dataloader
   */
  getOptions?(): DataLoader.Options<ID, Type, string>;
}

/**
 * Extended interface when ID is not string
 */
export interface NestDataLoaderWithOptions<ID, Type> extends BaseNestDataLoader<ID, Type> {
  /**
   * Should return options for dataloader
   */
  getOptions(): DataLoader.Options<ID, Type, string> &
    Required<Pick<DataLoader.Options<ID, Type, string>, 'cacheKeyFn'>>;
}

/**
 * Conditional type to determine which interface to use based on ID type
 */
export type NestDataLoader<ID, Type> = ID extends string
  ? BaseNestDataLoader<ID, Type>
  : NestDataLoaderWithOptions<ID, Type>;

/**
 * Context key where get loader function will be stored.
 * This class should be added to your module providers like so:
 * {
 *     provide: APP_INTERCEPTOR,
 *     useClass: DataLoaderInterceptor,
 * },
 */
export const NEST_LOADER_CONTEXT_KEY: string = 'NEST_LOADER_CONTEXT_KEY';

@Injectable()
export class DataLoaderInterceptor implements NestInterceptor {
  constructor(private readonly moduleRef: ModuleRef) {}
  /**
   * @inheritdoc
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const graphqlExecutionContext = GqlExecutionContext.create(context);
    const ctx = graphqlExecutionContext.getContext();

    if (ctx[NEST_LOADER_CONTEXT_KEY] === undefined) {
      ctx[NEST_LOADER_CONTEXT_KEY] = {
        contextId: ContextIdFactory.create(),
        getLoader: (type: string): Promise<NestDataLoader<any, any>> => {
          if (ctx[type] === undefined) {
            try {
              ctx[type] = (async () => {
                const dataLoaderImplementation = await this.moduleRef.resolve<
                  NestDataLoader<any, any>
                >(type, ctx[NEST_LOADER_CONTEXT_KEY].contextId, {
                  strict: false,
                });
                return new DataLoader(
                  dataLoaderImplementation.getBatchFunction(),
                  dataLoaderImplementation.getOptions?.(),
                );
              })();
            } catch (e) {
              throw new InternalServerErrorException(`The loader ${type} is not provided` + e);
            }
          }
          return ctx[type];
        },
      };
    }
    return next.handle();
  }
}

/**
 * The decorator to be used within your graphql method.
 */
export const Loader = createParamDecorator(
  async (
    data: Type<NestDataLoader<any, any>>,
    context: ExecutionContext & { [key: string]: any },
  ) => {
    const ctx: any = GqlExecutionContext.create(context).getContext();
    if (ctx[NEST_LOADER_CONTEXT_KEY] === undefined) {
      throw new InternalServerErrorException(`
            You should provide interceptor ${DataLoaderInterceptor.name} globally with ${APP_INTERCEPTOR}
          `);
    }
    return await ctx[NEST_LOADER_CONTEXT_KEY].getLoader(data);
  },
);

export type DataLoaderResponse<T extends NestDataLoader<any, any>> =
  Awaited<ReturnType<ReturnType<T['getBatchFunction']>>> extends (infer E)[] ? E : never;
