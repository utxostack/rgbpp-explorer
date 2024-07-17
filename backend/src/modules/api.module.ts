import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';
import { SentryService } from '@ntegral/nestjs-sentry';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DataLoaderInterceptor } from '@applifting-io/nestjs-dataloader';
import { CkbModule } from './ckb/ckb.module';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService, SentryService],
      useFactory: async (configService: ConfigService, sentryService: SentryService) => ({
        playground: configService.get('NODE_ENV') !== 'production',
        installSubscriptionHandlers: true,
        introspection: true,
        autoSchemaFile: true,
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
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,
    },
  ],
})
export class ApiModule {}
