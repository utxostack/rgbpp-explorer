import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { SentryService } from '@ntegral/nestjs-sentry';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { DataLoaderInterceptor } from '@applifting-io/nestjs-dataloader';
import { Env } from 'src/env';
import { CkbModule } from './ckb/ckb.module';
import { RgbppModule } from './rgbpp/rgbpp.module';
import { BitcoinModule } from './bitcoin/bitcoin.module';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService, SentryService],
      useFactory: async (configService: ConfigService<Env>, sentryService: SentryService) => ({
        playground: configService.get('ENABLED_GRAPHQL_PLAYGROUND'),
        installSubscriptionHandlers: true,
        introspection: true,
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        buildSchemaOptions: {
          dateScalarMode: 'timestamp',
        },
        context: () => {
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
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,
    },
  ],
})
export class ApiModule {}
