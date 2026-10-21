import { Controller, Get, Query } from '@nestjs/common';
import { DemographicsService } from './demographics.service';
import { CountriesQueryDto } from './dto/countries-query.dto';
import { PopulationHistoryQueryDto } from './dto/population-history-query.dto';

@Controller('demographics')
export class DemographicsController {
  constructor(private readonly demographicsService: DemographicsService) {}

  @Get('countries')
  findCountries(@Query() query: CountriesQueryDto) {
    return this.demographicsService.findCountries(query);
  }

  @Get('population-history')
  findPopulationHistory(@Query() { countries }: PopulationHistoryQueryDto) {
    return this.demographicsService.findPopulationHistory(countries);
  }

  @Get('continent-summary')
  getContinentSummary() {
    return this.demographicsService.getContinentSummary();
  }
}
