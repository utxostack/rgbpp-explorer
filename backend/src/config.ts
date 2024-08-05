import { ConfigModule } from '@nestjs/config';
import { envSchema } from './env';

const configModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath:
    process.env.NODE_ENV === 'production'
      ? ['.env.production.local', '.env.production', '.env']
      : ['.env.development.local', '.env.development', '.env'],
  validate: envSchema.parse,
});

export default configModule;
