import { config, helpers } from '@ckb-lumos/lumos';
import { PipeTransform, Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isValidAddress } from '@rgbpp-sdk/btc';
import { BtcNetworkTypeMap, NetworkType } from 'src/constants';

@Injectable()
export class ValidateCkbAddressPipe implements PipeTransform {
  private logger = new Logger(ValidateCkbAddressPipe.name);

  constructor(private configService: ConfigService) { }

  public transform(value: string) {
    try {
      const network = this.configService.get('NETWORK');
      const lumosConfig = network === NetworkType.mainnet ? config.MAINNET : config.TESTNET;
      helpers.parseAddress(value, { config: lumosConfig });
      return value;
    } catch (err) {
      this.logger.error(`Invalid CKB address: ${value}`, err);
      throw new BadRequestException('Invalid CKB address');
    }
  }
}

@Injectable()
export class TryValidateCkbAddressPipe extends ValidateCkbAddressPipe implements PipeTransform {
  public transform(value: string) {
    try {
      return super.transform(value);
    } catch {
      return null;
    }
  }
}

@Injectable()
export class ValidateBtcAddressPipe implements PipeTransform {
  private logger = new Logger(ValidateBtcAddressPipe.name);

  constructor(private configService: ConfigService) { }

  public transform(value: string) {
    const network = this.configService.get('NETWORK');
    const isValid = isValidAddress(value, BtcNetworkTypeMap[network]);
    if (!isValid) {
      this.logger.error(`Invalid bitcoin address: ${value}`);
      throw new BadRequestException('Invalid bitcoin address');
    }
    return value;
  }
}

@Injectable()
export class TryValidateBtcAddressPipe extends ValidateBtcAddressPipe implements PipeTransform {
  public transform(value: string) {
    try {
      return super.transform(value);
    } catch {
      return null;
    }
  }
}
