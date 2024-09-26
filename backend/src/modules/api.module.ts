import { join } from 'node:path';
import { ExecutionContext, Injectable, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext, GraphQLModule } from '@nestjs/graphql';
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
import { SentryGlobalGraphQLFilter } from '@sentry/nestjs/setup';
import { AllExceptionsFilter } from 'src/filters/all-exceptions.filter';

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
        throttlers: [
          {
            ttl: configService.get('RATE_LIMIT_WINDOW_MS')!,
            limit: configService.get('RATE_LIMIT_PER_MINUTE')!,
          },
        ],
      }),
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<Env>) => ({
        playground: configService.get('ENABLED_GRAPHQL_PLAYGROUND'),
        installSubscriptionHandlers: true,
        introspection: true,
        graphiql: true,
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        buildSchemaOptions: {
          dateScalarMode: 'timestamp',
          fieldMiddleware: [fieldPerformanceMiddleware],
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
  ],
})
export class ApiModule { }
