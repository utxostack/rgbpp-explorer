import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import configModule from 'src/config';
import {
  TryValidateBtcAddressPipe,
  TryValidateCkbAddressPipe,
  ValidateBtcAddressPipe,
  ValidateCkbAddressPipe,
} from 'src/pipes/validate-address.pipe';

const validCkbAddress =
  'ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqtyy4lspd4k86v8vz06n03dpjrdx5gzp7cxulwv8';
const validBtcAddress = 'tb1q766jw0se6wmp5jttql67hw98cletne8vd5yq2y';

describe('ValidateAddressPipe', () => {
  let configService: ConfigService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [configModule],
      controllers: [],
      providers: [],
    }).compile();

    configService = moduleRef.get<ConfigService>(ConfigService);
  });

  describe('ValidateCkbAddressPipe', () => {
    it('should return an valid address', async () => {
      const pipe = new ValidateCkbAddressPipe(configService);
      const address = pipe.transform(validCkbAddress);
      expect(address).toBe(validCkbAddress);
    });

    it('should throw an error for an invalid address', async () => {
      const pipe = new ValidateCkbAddressPipe(configService);
      expect(() => pipe.transform('invalid-ckb-address')).toThrowError();
    });
  });

  describe('TryValidateCkbAddressPipe', () => {
    it('should return an valid address', async () => {
      const pipe = new TryValidateCkbAddressPipe(configService);
      const address = pipe.transform(validCkbAddress);
      expect(address).toBe(validCkbAddress);
    });

    it('should return null for an invalid address', async () => {
      const pipe = new TryValidateCkbAddressPipe(configService);
      const address = pipe.transform('invalid-ckb-address');
      expect(address).toBeNull();
    });
  });

  describe('ValidateBtcAddressPipe', () => {
    it('should return an valid address', async () => {
      const pipe = new ValidateBtcAddressPipe(configService);
      const address = pipe.transform(validBtcAddress);
      expect(address).toBe(validBtcAddress);
    });

    it('should throw an error for an invalid address', async () => {
      const pipe = new ValidateBtcAddressPipe(configService);
      expect(() => pipe.transform('invalid-btc-address')).toThrowError();
    });
  });

  describe('TryValidateBtcAddressPipe', () => {
    it('should return an valid address', async () => {
      const pipe = new TryValidateBtcAddressPipe(configService);
      const address = pipe.transform(validBtcAddress);
      expect(address).toBe(validBtcAddress);
    });

    it('should return null for an invalid address', async () => {
      const pipe = new TryValidateBtcAddressPipe(configService);
      const address = pipe.transform('invalid-btc-address');
      expect(address).toBeNull();
    });
  });
});
