import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { SentryService } from '@ntegral/nestjs-sentry';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { DataLoaderInterceptor } from '@applifting-io/nestjs-dataloader';
import { Env } from 'src/env';
import { CkbModule } from './ckb/ckb.module';
import { RgbppModule } from './rgbpp/rgbpp.module';
import { BitcoinModule } from './bitcoin/bitcoin.module';
import { FastifyReply, FastifyRequest } from 'fastify';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    GraphQLModule.forRootAsync<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      inject: [ConfigService, SentryService],
      useFactory: async (configService: ConfigService<Env>, sentryService: SentryService) => ({
        playground: configService.get('ENABLED_GRAPHQL_PLAYGROUND'),
        installSubscriptionHandlers: true,
        introspection: true,
        graphiql: true,
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        buildSchemaOptions: {
          dateScalarMode: 'timestamp',
        },
        context: (req: FastifyRequest, res: FastifyReply) => {
          if (req.method === 'GET') {
            res.redirect(302, '/graphiql');
            return;
          }
          return {
            span: sentryService.instance().startInactiveSpan({
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
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,
    },
  ],
})
export class ApiModule { }
