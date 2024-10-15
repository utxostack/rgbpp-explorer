import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SentryModule } from '@sentry/nestjs/setup';
import type { RedisClientOptions } from 'redis';
import { redisStore } from 'cache-manager-redis-yet';
import { Env } from './env';
import { CoreModule } from './core/core.module';
import { ApiModule } from './modules/api.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import configModule from './config';
import { AppController } from './app.controller';
import { BootstrapService } from './bootstrap.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

const logger = new Logger('CacheStore');

async function createCacheStore(redisUrl: string) {
  const store = await redisStore({
    url: redisUrl,
    isCacheable: (value: unknown) => value !== undefined,
  });
  return {
    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
      try {
        return store.set(key, value, ttl);
      } catch (e) {
        logger.error(`Failed to set cache key ${key}: ${e}`);
        return undefined;
      }
    },
    async get<T>(key: string): Promise<T | undefined> {
      try {
        return store.get(key);
      } catch (e) {
        logger.error(`Failed to get cache key ${key}: ${e}`);
        return undefined;
      }
    },
    async del(key: string): Promise<void> {
      return store.del(key);
    },
  } satisfies CacheStore;
}

@Module({
  imports: [
    configModule,
    SentryModule.forRoot(),
    CacheModule.registerAsync<RedisClientOptions>({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<Env>) => {
        const store = await createCacheStore(configService.get('REDIS_CACHE_URL')!);
        return {
          store,
        };
      },
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<Env>) => {
        const url = new URL(configService.get('REDIS_QUEUE_URL')!);
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
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    CoreModule,
    ApiModule,
  ],
  providers: [AppController, BootstrapService],
  controllers: [AppController],
})
export class AppModule { }
