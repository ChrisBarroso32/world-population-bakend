import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../lib/database/prisma.service';
import { CACHE_KEYS, LATEST_YEAR } from './demographics.constants';
import {
  ContinentSummaryResponse,
  CountryResponse,
  PopulationHistoryResponse,
} from './dto/demographics-response.dto';
import { CountriesQueryDto } from './dto/countries-query.dto';

interface ContinentSummaryRow {
  continent: string;
  totalPopulation: bigint;
  countryCount: bigint;
}

@Injectable()
export class DemographicsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async findCountries({
    search,
    continent,
  }: CountriesQueryDto): Promise<CountryResponse[]> {
    const countries = await this.cache.wrap(CACHE_KEYS.countries, () =>
      this.loadCountries(),
    );

    // Los filtros se aplican en memoria sobre la lista completa cacheada: así
    // el caché tiene una sola clave y no crece con cada búsqueda distinta.
    const term = search?.toLowerCase();
    const continentName = continent?.toLowerCase();
    return countries.filter(
      (country) =>
        (!term ||
          country.name.toLowerCase().includes(term) ||
          country.cca3.toLowerCase() === term) &&
        (!continentName || country.continent.toLowerCase() === continentName),
    );
  }

  async findPopulationHistory(
    codes: string[],
  ): Promise<PopulationHistoryResponse[]> {
    const byCode = await this.cache.wrap(CACHE_KEYS.populationHistory, () =>
      this.loadPopulationHistory(),
    );

    const missing = codes.filter((code) => !byCode[code]);
    if (missing.length > 0) {
      throw new NotFoundException(
        `Países no encontrados: ${missing.join(', ')}`,
      );
    }

    return codes.map((code) => byCode[code]);
  }

  getContinentSummary(): Promise<ContinentSummaryResponse[]> {
    return this.cache.wrap(CACHE_KEYS.continentSummary, () =>
      this.loadContinentSummary(),
    );
  }

  private async loadCountries(): Promise<CountryResponse[]> {
    const countries = await this.prisma.country.findMany({
      include: { populationRecords: { where: { year: LATEST_YEAR } } },
    });

    return countries
      .map(({ populationRecords, ...country }) => ({
        ...country,
        density: Number(country.density),
        growthRate: Number(country.growthRate),
        worldPercentage: Number(country.worldPercentage),
        population: populationRecords[0]
          ? Number(populationRecords[0].population)
          : null,
      }))
      .sort(
        (a, b) =>
          (b.population ?? 0) - (a.population ?? 0) ||
          a.name.localeCompare(b.name),
      );
  }

  private async loadPopulationHistory(): Promise<
    Record<string, PopulationHistoryResponse>
  > {
    const countries = await this.prisma.country.findMany({
      include: { populationRecords: { orderBy: { year: 'asc' } } },
    });

    return Object.fromEntries(
      countries.map((country) => [
        country.cca3,
        {
          cca3: country.cca3,
          name: country.name,
          continent: country.continent,
          series: country.populationRecords.map(({ year, population }) => ({
            year,
            population: Number(population),
          })),
        },
      ]),
    );
  }

  private async loadContinentSummary(): Promise<ContinentSummaryResponse[]> {
    const rows = await this.prisma.$queryRaw<ContinentSummaryRow[]>`
      SELECT c."continent" AS "continent",
             SUM(pr."population") AS "totalPopulation",
             COUNT(*) AS "countryCount"
      FROM "population_records" pr
      JOIN "countries" c ON c."cca3" = pr."countryCca3"
      WHERE pr."year" = ${LATEST_YEAR}
      GROUP BY c."continent"
      ORDER BY SUM(pr."population") DESC
    `;

    const total = rows.reduce(
      (sum, row) => sum + Number(row.totalPopulation),
      0,
    );

    // Centésimas de punto porcentual; el residuo del redondeo se asigna a la
    // primera fila (la de mayor población) para que la suma sea exactamente 100.
    const hundredths = rows.map((row) =>
      total ? Math.round((Number(row.totalPopulation) / total) * 10000) : 0,
    );
    if (total && hundredths.length > 0) {
      hundredths[0] +=
        10000 - hundredths.reduce((sum, value) => sum + value, 0);
    }

    return rows.map((row, index) => ({
      continent: row.continent,
      totalPopulation: Number(row.totalPopulation),
      countryCount: Number(row.countryCount),
      percentage: hundredths[index] / 100,
    }));
  }
}
