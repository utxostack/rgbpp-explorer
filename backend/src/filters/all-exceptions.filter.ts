import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { SentryGlobalGraphQLFilter } from '@sentry/nestjs/setup';

const SKIP_REQUEST_URLS = ['/health', '/version'];

@Catch()
export class AllExceptionsFilter extends SentryGlobalGraphQLFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {
    super();
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const type = host.getType();
    if (type === 'http') {
      const ctx = host.switchToHttp();
      const request = ctx.getRequest();
      if (SKIP_REQUEST_URLS.includes(request.url)) {
        const response = (exception as HttpException)?.getResponse();
        if (response) {
          this.httpAdapterHost.httpAdapter.reply(ctx.getResponse(), response, 200);
          return;
        }
        this.httpAdapterHost.httpAdapter.reply(ctx.getResponse(), exception, 500);
        return;
      }
    }

    super.catch(exception, host);
  }
}
