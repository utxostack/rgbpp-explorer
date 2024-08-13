import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from './env';

@Controller()
export class AppController {
  constructor(
    private configService: ConfigService<Env>,
  ) {}

  @Get('version')
  version() {
    const version = this.configService.get('APP_VERSION');
    const commitHash = this.configService.get('GIT_COMMIT_HASH');
    return `v${version} (${commitHash})`
  }
}
