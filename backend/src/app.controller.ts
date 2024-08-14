import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from './env';
import { version } from '../package.json';

@Controller()
export class AppController {
  private gitCommitHash: string;

  constructor(
    private configService: ConfigService<Env>,
  ) {}

  /**
   * Try to get git commit hash
   */
  private get commitHash() {
    if (!this.gitCommitHash) {
      try {
        const { execSync } = require('child_process');
        this.gitCommitHash = execSync('git rev-parse --short HEAD').toString().trim();
      } catch (err) {
        console.error('Failed to get git commit hash', err);
        this.gitCommitHash = 'HEAD';
      }
    }

    return this.gitCommitHash;
  }

  @Get('version')
  version() {
    const sematicVer = this.configService.get('APP_VERSION') ?? version;
    return `v${sematicVer} (${this.commitHash})`
  }
}
