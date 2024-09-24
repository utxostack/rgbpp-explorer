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
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    if (SKIP_REQUEST_URLS.includes(request.url)) {
      const response = (exception as HttpException).getResponse();
      const status = (exception as HttpException).getStatus();
      this.httpAdapterHost.httpAdapter.reply(ctx.getResponse(), response, status);
      return;
    }

    super.catch(exception, host);
  }
}
