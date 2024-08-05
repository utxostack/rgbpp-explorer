import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { envSchema } from './env';

const env = envSchema.parse(process.env);

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

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
