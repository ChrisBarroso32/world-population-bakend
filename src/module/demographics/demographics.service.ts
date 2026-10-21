import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../lib/database/prisma.service';
import { LATEST_YEAR } from './demographics.constants';
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
  constructor(private readonly prisma: PrismaService) {}

  async findCountries({
    search,
    continent,
  }: CountriesQueryDto): Promise<CountryResponse[]> {
    const where: Prisma.CountryWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { cca3: { equals: search, mode: 'insensitive' } },
      ];
    }
    if (continent) {
      where.continent = { equals: continent, mode: 'insensitive' };
    }

    const countries = await this.prisma.country.findMany({
      where,
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

  async findPopulationHistory(
    codes: string[],
  ): Promise<PopulationHistoryResponse[]> {
    const countries = await this.prisma.country.findMany({
      where: { cca3: { in: codes } },
      include: { populationRecords: { orderBy: { year: 'asc' } } },
    });

    const byCode = new Map(countries.map((country) => [country.cca3, country]));
    const missing = codes.filter((code) => !byCode.has(code));
    if (missing.length > 0) {
      throw new NotFoundException(
        `Países no encontrados: ${missing.join(', ')}`,
      );
    }

    return codes.map((code) => {
      const country = byCode.get(code)!;
      return {
        cca3: country.cca3,
        name: country.name,
        continent: country.continent,
        series: country.populationRecords.map(({ year, population }) => ({
          year,
          population: Number(population),
        })),
      };
    });
  }

  async getContinentSummary(): Promise<ContinentSummaryResponse[]> {
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
