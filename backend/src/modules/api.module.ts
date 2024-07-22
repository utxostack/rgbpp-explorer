import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';
import { SentryService } from '@ntegral/nestjs-sentry';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DataLoaderInterceptor } from '@applifting-io/nestjs-dataloader';
import { CkbModule } from './ckb/ckb.module';
import { RgbppModule } from './rgbpp/rgbpp.module';
import { BitcoinModule } from './bitcoin/bitcoin.module';
import { Env } from 'src/env';
import { join } from 'path';

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
