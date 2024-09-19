import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';
import * as Sentry from '@sentry/nestjs';

export const fieldPerformanceMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const now = performance.now();
  const memoryUsage = process.memoryUsage();

  const value = await next();

  const executionTime = performance.now() - now;
  const memoryUsageAfter = process.memoryUsage();

  Sentry.setContext('graphql', {
    executionTime,
    field: ctx.info.fieldName,
    parent: ctx.info.parentType.name,
  });
  Sentry.setMeasurement('graphql.executionTime', executionTime, 'millisecond');
  Sentry.setMeasurement(
    'graphql.memoryUsage',
    memoryUsageAfter.heapUsed - memoryUsage.heapUsed,
    'byte',
  );
  return value;
};
