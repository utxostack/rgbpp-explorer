import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import * as Sentry from '@sentry/nestjs';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(
    private prismaService: PrismaService,
  ) {
    super();
  }

  public async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      return this.getStatus('database.prisma', true);
    } catch (e) {
      Sentry.captureException(e);
      throw new HealthCheckError('BitcoinApiService failed', e);
    }
  }
}
