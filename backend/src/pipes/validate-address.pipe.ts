import { config, helpers } from '@ckb-lumos/lumos';
import {
  PipeTransform,
  Injectable,
  BadRequestException,
  Logger,
  ArgumentMetadata,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isValidAddress } from '@rgbpp-sdk/btc';
import { BtcNetworkTypeMap, NetworkType } from 'src/constants';
import { Env } from 'src/env';

abstract class BaseValidateAddressPipe implements PipeTransform {
  protected logger = new Logger(this.constructor.name);
  protected abstract validateAddress(value: string): boolean;
  protected abstract getErrorMessage(): string;

  transform(value: string) {
    if (!this.validateAddress(value)) {
      this.logger.error(`Invalid address: ${value}`);
      throw new BadRequestException(this.getErrorMessage());
    }
    return value;
  }
}

@Injectable()
export class ValidateCkbAddressPipe extends BaseValidateAddressPipe {
  constructor(protected configService: ConfigService<Env>) {
    super();
  }

  protected validateAddress(value: string): boolean {
    try {
      const network = this.configService.get('NETWORK', { infer: true });
      const lumosConfig = network === NetworkType.mainnet ? config.MAINNET : config.TESTNET;
      helpers.parseAddress(value, { config: lumosConfig });
      return true;
    } catch {
      return false;
    }
  }

  protected getErrorMessage(): string {
    return 'Invalid CKB address';
  }
}

@Injectable()
export class ValidateBtcAddressPipe extends BaseValidateAddressPipe {
  constructor(protected configService: ConfigService<Env>) {
    super();
  }

  protected validateAddress(value: string): boolean {
    const network = this.configService.get('NETWORK', { infer: true });
    return isValidAddress(value, BtcNetworkTypeMap[network ?? NetworkType.testnet]);
  }

  protected getErrorMessage(): string {
    return 'Invalid bitcoin address';
  }
}

function createTryValidatePipe(
  BasePipe: new (...args: any[]) => PipeTransform,
): new (...args: any[]) => PipeTransform {
  return class extends BasePipe {
    transform(value: string, metadata: ArgumentMetadata) {
      try {
        return super.transform(value, metadata);
      } catch {
        return null;
      }
    }
  };
}

export const TryValidateCkbAddressPipe = createTryValidatePipe(ValidateCkbAddressPipe);
export const TryValidateBtcAddressPipe = createTryValidatePipe(ValidateBtcAddressPipe);
