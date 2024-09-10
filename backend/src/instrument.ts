import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    // @ts-ignore
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 0.5,
  profilesSampleRate: 0.5,
});
