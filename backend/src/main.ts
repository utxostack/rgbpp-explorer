import './instrument';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { envSchema } from './env';
import { BootstrapService } from './bootstrap.service';
import { LogLevel } from '@nestjs/common';
import cluster from 'node:cluster';

const env = envSchema.parse(process.env);
const LOGGER_LEVELS: LogLevel[] = ['verbose', 'debug', 'log', 'warn', 'error'];

function getLoggerOptions() {
  const index = LOGGER_LEVELS.indexOf(env.LOGGER_LEVEL as LogLevel);
  if (index === -1) {
    return LOGGER_LEVELS;
  }
  return LOGGER_LEVELS.slice(index);
}

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      trustProxy: true,
    }),
    {
      logger: getLoggerOptions(),
    },
  );

  if (cluster.isPrimary) {
    const bootstrapService = app.get(BootstrapService);
    await bootstrapService.bootstrapAssetsIndex();

    cluster.fork();
    cluster.on('exit', (worker) => {
      console.log(`worker ${worker.process.pid} died`);
      cluster.fork();
    });
    return;
  }

  if (env.CORS_WHITELIST.length > 0) {
    app.enableCors({
      origin: env.CORS_WHITELIST,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
    });
  }

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
