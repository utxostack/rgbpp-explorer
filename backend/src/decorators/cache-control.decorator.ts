import { Directive } from '@nestjs/graphql';

interface CacheControlOptions {
  maxAge?: number;
  scope?: 'PRIVATE' | 'PUBLIC';
  inheritMaxAge?: boolean;
}

export const CacheControl = ({ maxAge, scope = 'PUBLIC', inheritMaxAge }: CacheControlOptions) => {
  const args = [
    `scope: ${scope}`,
    maxAge !== undefined ? `maxAge: ${maxAge}` : null,
    inheritMaxAge ? `inheritMaxAge: ${inheritMaxAge}` : null,
  ]
    .filter(Boolean)
    .join(', ');

  return Directive(`@cacheControl(${args})`);
};
