import { Logger } from '@nestjs/common';
import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';

export const fieldPerformanceMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const now = performance.now();
  const value = await next();

  const executionTime = performance.now() - now;
  if (executionTime > 300) {
    const { path } = ctx.info;
    logger.debug(`[${path.typename}.${path.key}]: ${executionTime}ms`);
  }
  return value;
};

const logger = new Logger(fieldPerformanceMiddleware.name);
