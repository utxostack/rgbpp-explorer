import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { HttpException, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SentryInterceptor, SentryModule } from '@ntegral/nestjs-sentry';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import type { RedisClientOptions } from 'redis';
import { redisStore } from 'cache-manager-redis-yet';
import { Env } from './env';
import { CoreModule } from './core/core.module';
import { ApiModule } from './modules/api.module';
import { CacheableModule } from 'nestjs-cacheable';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import configModule from './config';

@Module({
  imports: [
    configModule,
    SentryModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<Env>) => ({
        dsn: configService.get('SENTRY_DSN'),
        environment: configService.get('NODE_ENV'),
        tracesSampleRate: 0.5,
        profilesSampleRate: 0.5,
        integrations: [nodeProfilingIntegration()],
        logLevels:
          configService.get('NODE_ENV') === 'production'
            ? ['warn', 'error']
            : ['debug', 'log', 'warn', 'error'],
      }),
      inject: [ConfigService],
    }),
    CacheableModule.register(),
    CacheModule.registerAsync<RedisClientOptions>({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<Env>) => {
        const store = (await redisStore({
          url: configService.get('REDIS_URL'),
        })) as unknown as CacheStore;
        return {
          store,
        };
      },
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<Env>) => {
        const url = new URL(configService.get('REDIS_URL')!);
        return {
          connection: {
            host: url.hostname,
            port: parseInt(url.port),
            username: url.username,
            password: url.password,
          },
        };
      },
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    CoreModule,
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
export class AppModule {}
