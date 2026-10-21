import { Module } from '@nestjs/common';
import { DemographicsService } from './demographics.service';
import { DemographicsController } from './demographics.controller';

@Module({
  providers: [DemographicsService],
  controllers: [DemographicsController],
})
export class DemographicsModule {}
