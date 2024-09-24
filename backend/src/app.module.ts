import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SentryModule } from '@sentry/nestjs/setup';
import type { RedisClientOptions } from 'redis';
import { redisStore } from 'cache-manager-redis-yet';
import { Env } from './env';
import { CoreModule } from './core/core.module';
import { ApiModule } from './modules/api.module';
import { CacheableModule } from 'nestjs-cacheable';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import configModule from './config';
import { AppController } from './app.controller';
import { BootstrapService } from './bootstrap.service';

@Module({
  imports: [
    configModule,
    SentryModule.forRoot(),
    CacheableModule.register(),
    CacheModule.registerAsync<RedisClientOptions>({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<Env>) => {
        const store = (await redisStore({
          url: configService.get('REDIS_URL'),
          isCacheable: (value) => value !== undefined,
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
  providers: [
    AppController,
    BootstrapService,
  ],
  controllers: [AppController],
})
export class AppModule { }
