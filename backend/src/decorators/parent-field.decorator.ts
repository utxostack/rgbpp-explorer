import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const ParentField = createParamDecorator((param: string, ctx: ExecutionContext) => {
  const root = GqlExecutionContext.create(ctx).getRoot();
  const value = root[param];
  return value;
});
