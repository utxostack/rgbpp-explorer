import * as pLimit from 'p-limit';

export interface PLimitOptions {
  concurrency: number;
}

export function PLimit(options: PLimitOptions): MethodDecorator {
  const limit = pLimit(options.concurrency);

  return function (target, propertyKey, descriptor) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const originalMethod = descriptor.value as unknown as Function;

    return {
      ...descriptor,
      value: function (...args: any[]) {
        return limit(() => originalMethod.apply(this, args));
      },
    } as any;
  };
}
