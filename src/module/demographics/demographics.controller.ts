import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DemographicsService } from './demographics.service';
import { CountriesQueryDto } from './dto/countries-query.dto';
import {
  ContinentSummaryResponse,
  CountryResponse,
  PopulationHistoryResponse,
} from './dto/demographics-response.dto';
import { PopulationHistoryQueryDto } from './dto/population-history-query.dto';

@ApiTags('Demographics')
@Controller('demographics')
export class DemographicsController {
  constructor(private readonly demographicsService: DemographicsService) {}

  @Get('countries')
  @ApiOperation({
    summary: 'Listar países',
    description:
      'Devuelve todos los países ordenados por población descendente y luego por nombre.',
  })
  @ApiOkResponse({ type: [CountryResponse] })
  @ApiBadRequestResponse({ description: 'Parámetros de query inválidos' })
  findCountries(@Query() query: CountriesQueryDto) {
    return this.demographicsService.findCountries(query);
  }

  @Get('population-history')
  @ApiOperation({
    summary: 'Historial de población por país',
    description:
      'Devuelve la serie histórica de cada país solicitado, en el orden pedido.',
  })
  @ApiOkResponse({ type: [PopulationHistoryResponse] })
  @ApiBadRequestResponse({
    description: 'countries ausente, vacío, con formato inválido o más de 50',
  })
  @ApiNotFoundResponse({
    description: 'Uno o más códigos no existen (se listan en el mensaje)',
  })
  findPopulationHistory(@Query() { countries }: PopulationHistoryQueryDto) {
    return this.demographicsService.findPopulationHistory(countries);
  }

  @Get('continent-summary')
  @ApiOperation({
    summary: 'Resumen por continente',
    description:
      'Población total de 2022, cantidad de países y porcentaje mundial por continente.',
  })
  @ApiOkResponse({ type: [ContinentSummaryResponse] })
  getContinentSummary() {
    return this.demographicsService.getContinentSummary();
  }
}
