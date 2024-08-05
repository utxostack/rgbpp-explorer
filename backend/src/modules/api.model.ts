import { registerEnumType } from '@nestjs/graphql';

export enum OrderType {
  Desc = 'desc',
  Asc = 'asc',
}

registerEnumType(OrderType, {
  name: 'OrderType',
});
