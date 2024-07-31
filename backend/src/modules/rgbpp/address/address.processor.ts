import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { RgbppAddressService } from './address.service';

@Processor('rgbpp-address')
export class RgbppAddressProcessor extends WorkerHost {
  private readonly logger = new Logger(RgbppAddressProcessor.name);

  constructor(private rgbppAddressService: RgbppAddressService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'collect-rgbpp-address-cells': {
        return this.collectRgbppAddressCells(job.data.btcAddress);
      }
    }
  }

  async collectRgbppAddressCells(btcAddress: string) {
    this.logger.log(`Collecting RGBPP address cells for ${btcAddress}`);
    const cells = await this.rgbppAddressService.collectRgbppAddressCells(btcAddress);
    await this.rgbppAddressService.setRgbppAddressCells(cells);
    this.logger.log(`Collected ${cells.length} RGBPP address cells for ${btcAddress}`);
  }
}
