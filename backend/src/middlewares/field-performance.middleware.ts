import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';
import * as Sentry from '@sentry/nestjs';

export const fieldPerformanceMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const now = performance.now();
  const memoryUsageNow = process.memoryUsage();

  const value = await next();

  const executionTime = performance.now() - now;
  const memoryUsage = process.memoryUsage().heapUsed - memoryUsageNow.heapUsed;

  Sentry.setContext('graphql', {
    executionTime,
    memoryUsage,
    field: ctx.info.fieldName,
    parent: ctx.info.parentType.name,
  });
  Sentry.setMeasurement('graphql.executionTime', executionTime, 'millisecond');
  Sentry.setMeasurement('graphql.memoryUsage', memoryUsage, 'byte');
  return value;
};
