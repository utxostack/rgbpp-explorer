import { join } from 'node:path';
import { ExecutionContext, Injectable, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext, GraphQLModule, Int } from '@nestjs/graphql';
import { DataLoaderInterceptor } from 'src/common/dataloader';
import { Env } from 'src/env';
import { CkbModule } from './ckb/ckb.module';
import { RgbppModule } from './rgbpp/rgbpp.module';
import { BitcoinModule } from './bitcoin/bitcoin.module';
import { SearchModule } from './search/search.module';
import { fieldPerformanceMiddleware } from 'src/middlewares/field-performance.middleware';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ComplexityPlugin } from './complexity.plugin';
import * as Sentry from '@sentry/nestjs';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';
import responseCachePlugin from '@apollo/server-plugin-response-cache';
import { AllExceptionsFilter } from 'src/filters/all-exceptions.filter';
import { DirectiveLocation, GraphQLBoolean, GraphQLDirective, GraphQLEnumType } from 'graphql';
import { LoggingPlugin } from './logging.plugin';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext();
    return { req: ctx.request, res: ctx.reply };
  }
}

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<Env>) => ({
        getTracker: (req: Record<string, any>) => {
          return req.ips.length ? req.ips[0] : req.ip;
        },
        throttlers: [
          {
            ttl: configService.get('RATE_LIMIT_WINDOW_MS')!,
            limit: configService.get('RATE_LIMIT_PER_MINUTE')!,
          },
        ],
        storage: new ThrottlerStorageRedisService(configService.get('REDIS_CACHE_URL')),
      }),
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService, CACHE_MANAGER],
      useFactory: async (configService: ConfigService<Env>, cacheManager: Cache) => ({
        playground: configService.get('ENABLED_GRAPHQL_PLAYGROUND'),
        installSubscriptionHandlers: true,
        introspection: true,
        graphiql: true,
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        plugins: [
          ApolloServerPluginCacheControl({
            defaultMaxAge: 10,
            calculateHttpHeaders: true,
          }),
          responseCachePlugin(),
        ],
        cache: {
          async get(key: string) {
            const val = await cacheManager.get(key);
            return val as string | undefined;
          },
          async set(key: string, value: string, options?: { ttl: number | null }) {
            const { ttl } = options || { ttl: null };
            await cacheManager.set(key, value, ttl ? ttl * 1000 : undefined);
          },
          async delete(key: string) {
            await cacheManager.del(key);
          },
        },
        buildSchemaOptions: {
          dateScalarMode: 'timestamp',
          fieldMiddleware: [fieldPerformanceMiddleware],
          directives: [
            new GraphQLDirective({
              name: 'cacheControl',
              args: {
                maxAge: { type: Int },
                scope: {
                  type: new GraphQLEnumType({
                    name: 'CacheControlScope',
                    values: {
                      PUBLIC: {},
                      PRIVATE: {},
                    },
                  }),
                },
                inheritMaxAge: { type: GraphQLBoolean },
              },
              locations: [
                DirectiveLocation.FIELD_DEFINITION,
                DirectiveLocation.OBJECT,
                DirectiveLocation.INTERFACE,
                DirectiveLocation.UNION,
                DirectiveLocation.QUERY,
              ],
            }),
          ],
        },
        context: (request: FastifyRequest, reply: FastifyReply) => {
          return {
            request,
            reply,
            span: Sentry.startInactiveSpan({
              op: 'gql',
              name: 'GraphQLTransaction',
            }),
          };
        },
      }),
    }),
    CkbModule,
    BitcoinModule,
    RgbppModule,
    SearchModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    ComplexityPlugin,
    LoggingPlugin,
  ],
})
export class ApiModule {}
