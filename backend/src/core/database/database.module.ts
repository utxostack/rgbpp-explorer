import { Global, Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { DatabaseHealthIndicator } from './database.health';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [DatabaseHealthIndicator],
  exports: [DatabaseHealthIndicator],
})
export class DatabaseModule {}
