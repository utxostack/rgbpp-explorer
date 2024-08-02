// eslint-disable-next-line no-restricted-imports
import { CacheableRegisterOptions, Cacheable as _Cacheable } from 'nestjs-cacheable';

export interface CustomCacheableRegisterOptions extends CacheableRegisterOptions {
  shouldCache?: (result: any) => boolean | Promise<boolean>;
}

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
  return function (_, propertyKey, descriptor) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const originalMethod = descriptor.value as unknown as Function;
    return {
      ...descriptor,
      value: async function (...args: any[]) {
        const returnVal = await originalMethod.apply(this, args);

        const cacheable = options.shouldCache ? await options.shouldCache(returnVal) : true;
        if (!cacheable) {
          return returnVal;
        }

        const fakeDescriptor = {
          value: () => returnVal,
        };
        return _Cacheable(options)(this, propertyKey, fakeDescriptor);
      } as any,
    };
  };
}
