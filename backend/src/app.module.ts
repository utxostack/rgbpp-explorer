import { HttpException, Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { ApiModule } from './api/api.module';
import { DataModule } from './data/data.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { SentryInterceptor, SentryModule } from '@ntegral/nestjs-sentry';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { envSchema } from './env';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? ['.env.production.local', '.env.production', '.env']
          : ['.env.development.local', '.env.development', '.env'],
      validate: envSchema.parse,
    }),
    SentryModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        dsn: configService.get('SENTRY_DSN'),
        environment: configService.get('NODE_ENV'),
        tracesSampleRate: 0.1,
        profilesSampleRate: 0.1,
        integrations: [nodeProfilingIntegration()],
        logLevels:
          configService.get('NODE_ENV') === 'production'
            ? ['warn', 'error']
            : ['debug', 'log', 'warn', 'error'],
      }),
      inject: [ConfigService],
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    CoreModule,
    DataModule,
    ApiModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useFactory: () =>
        new SentryInterceptor({
          filters: [
            {
              type: HttpException,
              filter: (exception: HttpException) => 500 >= exception.getStatus(),
            },
          ],
        }),
    },
  ],
})
export class AppModule { }
