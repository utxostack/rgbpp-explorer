import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';
import * as Sentry from '@sentry/nestjs';

export const fieldPerformanceMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const now = performance.now();
  const value = await next();
  const executionTime = performance.now() - now;
  Sentry.setTag('graphql.field', `${ctx.info.parentType.name}.${ctx.info.fieldName}`);
  Sentry.setMeasurement('graphql.executionTime', executionTime, 'millisecond');
  return value;
};
