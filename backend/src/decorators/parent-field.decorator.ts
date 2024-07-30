import { createParamDecorator, ExecutionContext, PipeTransform, Type } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

type ParentFieldData = [param: string, pipe: Type<PipeTransform>] | string;

export const ParentField = createParamDecorator((data: ParentFieldData, ctx: ExecutionContext) => {
  const root = GqlExecutionContext.create(ctx).getRoot();
  const [param, pipe] = Array.isArray(data) ? data : [data, undefined];
  const value = root[param];
  if (pipe) {
    const p = new pipe();
    return p.transform(value, { type: 'param', metatype: String });
  }
  return value;
});

