import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/env';
import serialize from 'serialize-javascript';
import { createHash } from 'crypto';

const logger = new Logger('Cacheable');

type KeyBuilder = string | ((...args: any[]) => string | string[]);

interface CacheOptions {
  key?: KeyBuilder;
  namespace?: KeyBuilder;
  ttl?: number;
  shouldCache?: (result: any, target: any) => boolean | Promise<boolean>;
}

function extractKeys(keyBuilder: KeyBuilder, args: any[]): string[] {
  const keys = typeof keyBuilder === 'function' ? keyBuilder(...args) : keyBuilder;
  return Array.isArray(keys) ? keys : [keys];
}

function generateCacheKey(options: {
  key?: KeyBuilder;
  namespace?: KeyBuilder;
  methodName: string;
  args: any[];
}): string {
  let keys: string[];
  if (options.key) {
    keys = extractKeys(options.key, options.args);
  } else {
    const hash = createHash('md5').update(serialize(options.args)).digest('hex');
    keys = [`${options.methodName}@${hash}`];
  }

  const namespace = options.namespace && extractKeys(options.namespace, options.args);
  const composedKey = keys.map((key) => (namespace ? `${namespace[0]}:${key}` : key))[0];

  return composedKey;
}

export function Cacheable(options: CacheOptions = {}): MethodDecorator {
  return function(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    Inject(CACHE_MANAGER)(target, '__cacheManager');
    Inject(ConfigService)(target, '__configService');

    descriptor.value = async function(...args: any[]) {
      const cacheManager = this.__cacheManager as Cache;
      if (!cacheManager) return originalMethod.apply(this, args);

      const configService = this.__configService as ConfigService<Env>;
      const branch = configService.get('GIT_BRANCH') || 'unknown';
      const prefix = configService.get('CACHE_KEY_PREFIX');

      const baseKey = generateCacheKey({
        methodName: String(propertyKey),
        key: options.key,
        namespace: options.namespace,
        args,
      });
      const fullCacheKey = `${prefix}-${branch}/${baseKey}`;

      const cachedValue = await cacheManager.get(fullCacheKey);
      if (cachedValue) {
        logger.debug(`Cache hit for key: ${baseKey}`);
        return cachedValue;
      }

      const result = await originalMethod.apply(this, args);
      const shouldCache = options.shouldCache ? await options.shouldCache(result, this) : true;

      if (shouldCache) {
        await cacheManager.set(fullCacheKey, result, options.ttl);
      }

      return result;
    };
    return descriptor;
  };
}
