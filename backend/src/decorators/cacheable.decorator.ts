// eslint-disable-next-line no-restricted-imports
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheableRegisterOptions, Cacheable as _Cacheable } from 'nestjs-cacheable';
import { cacheableHandle, generateComposedKey } from 'nestjs-cacheable/dist/cacheable.helper';
import { Env } from 'src/env';

export interface CustomCacheableRegisterOptions extends CacheableRegisterOptions {
  shouldCache?: (result: any, target: any) => boolean | Promise<boolean>;
}

const logger = new Logger('Cacheable');

/**
 * Cacheable decorator with custom options, based on the original Cacheable decorator from the nestjs-cacheable package.
 * Adds a shouldCache option to determine whether the result should be cached.
 *
 * @example
 * @Cacheable({
 *   ttl: 1000,
 *   key: (args: any[]) => args[0],
 *   shouldCache: (result: any) => result !== null,
 * });
 */
export function Cacheable(options: CustomCacheableRegisterOptions): MethodDecorator {
  const injectCacheService = Inject(CACHE_MANAGER);
  const injectConfigService = Inject(ConfigService);

  return function (target, propertyKey, descriptor) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const originalMethod = descriptor.value as unknown as Function;

    injectCacheService(target, '__cacheManager');
    injectConfigService(target, '__configService');
    return {
      ...descriptor,
      value: async function (...args: any[]) {
        const cacheManager = this.__cacheManager as Cache;
        if (!cacheManager) return originalMethod.apply(this, args);
        const composeOptions: Parameters<typeof generateComposedKey>[0] = {
          methodName: String(propertyKey),
          key: options.key,
          namespace: options.namespace,
          args,
        };
        const [key] = generateComposedKey(composeOptions);

        const configService = this.__configService as ConfigService<Env>;
        const branch = configService.get('GIT_BRANCH') ?? 'unknown';
        const version = configService.get('APP_VERSION') ?? '0.0.0';
        const prefix = `@rgbpp-explorer@v${version}/${branch}`;

        const returnVal = await cacheableHandle(
          `${prefix}/${key}`,
          () => originalMethod.apply(this, args),
          options.ttl,
        );

        // Remove the cache if shouldCache returns false
        const shouldCache = options.shouldCache ? await options.shouldCache(returnVal, this) : true;
        if (!shouldCache) {
          logger.debug(`Removing cache for key: ${key}`);
          await cacheManager.del(key);
        }
        return returnVal;
      } as any,
    };
  };
}
