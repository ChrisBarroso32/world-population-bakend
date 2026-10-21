import { ApiProperty } from '@nestjs/swagger';

export class CountryResponse {
  @ApiProperty({ description: 'Código ISO 3166-1 alfa-3', example: 'MEX' })
  cca3: string;

  @ApiProperty({ example: 'Mexico' })
  name: string;

  @ApiProperty({ example: 'Mexico City' })
  capital: string;

  @ApiProperty({ example: 'North America' })
  continent: string;

  @ApiProperty({ description: 'Superficie en km²', example: 1964375 })
  areaKm2: number;

  @ApiProperty({ description: 'Habitantes por km²', example: 66.0 })
  density: number;

  @ApiProperty({ description: 'Tasa de crecimiento anual', example: 1.0063 })
  growthRate: number;

  @ApiProperty({
    description: 'Porcentaje de la población mundial',
    example: 1.62,
  })
  worldPercentage: number;

  @ApiProperty({
    description: 'Población del último año disponible (2022); null si falta',
    type: Number,
    nullable: true,
    example: 127504125,
  })
  population: number | null;
}

export class PopulationPoint {
  @ApiProperty({ example: 2020 })
  year: number;

  @ApiProperty({ example: 125998302 })
  population: number;
}

export class PopulationHistoryResponse {
  @ApiProperty({ example: 'MEX' })
  cca3: string;

  @ApiProperty({ example: 'Mexico' })
  name: string;

  @ApiProperty({ example: 'North America' })
  continent: string;

  @ApiProperty({
    type: [PopulationPoint],
    description: 'Serie histórica ordenada por año',
  })
  series: PopulationPoint[];
}

export class ContinentSummaryResponse {
  @ApiProperty({ example: 'Asia' })
  continent: string;

  @ApiProperty({
    description: 'Población total del continente en 2022',
    example: 4721383274,
  })
  totalPopulation: number;

  @ApiProperty({ description: 'Cantidad de países', example: 50 })
  countryCount: number;

  @ApiProperty({
    description: 'Porcentaje de la población mundial (suma 100)',
    example: 59.2,
  })
  percentage: number;
}
