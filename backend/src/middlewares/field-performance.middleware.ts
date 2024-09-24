import { Logger } from '@nestjs/common';
import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';
import * as Sentry from '@sentry/nestjs';

export const fieldPerformanceMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const now = performance.now();
  const value = await next();
  const executionTime = performance.now() - now;

  Sentry.setContext('graphql', {
    executionTime,
    field: ctx.info.fieldName,
    parent: ctx.info.parentType.name,
  });
  Sentry.setMeasurement('graphql.executionTime', executionTime, 'millisecond');
  return value;
};

const logger = new Logger(fieldPerformanceMiddleware.name);
