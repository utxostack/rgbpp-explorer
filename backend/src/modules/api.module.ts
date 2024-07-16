import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BlockModule } from './block/block.module';
import { TransactionModule } from './transaction/transaction.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { ConfigService } from '@nestjs/config';
import { SentryService } from '@ntegral/nestjs-sentry';
import { CellModule } from './cell/cell.module';

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
    BlockchainModule,
    BlockModule,
    TransactionModule,
    CellModule,
  ],
})
export class ApiModule { }
