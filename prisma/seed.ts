import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Logger, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PrismaModule } from '../src/lib/database/prisma.module';
import { PrismaService } from '../src/lib/database/prisma.service';

const YEARS = [2022, 2020, 2015, 2010, 2000, 1990, 1980, 1970] as const;
const CSV_PATH = join(__dirname, '..', 'dataset', 'world_population.csv');

@Module({ imports: [PrismaModule] })
class SeedModule {}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (quoted) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

function readDataset() {
  const [headerLine, ...lines] = readFileSync(CSV_PATH, 'utf8')
    .replace(/^﻿/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '');
  const header = parseCsvLine(headerLine);
  const col = (name: string) => {
    const index = header.indexOf(name);
    if (index === -1) throw new Error(`Columna no encontrada en el CSV: ${name}`);
    return index;
  };

  const cols = {
    cca3: col('CCA3'),
    name: col('Country/Territory'),
    capital: col('Capital'),
    continent: col('Continent'),
    area: col('Area (km²)'),
    density: col('Density (per km²)'),
    growthRate: col('Growth Rate'),
    worldPercentage: col('World Population Percentage'),
    population: Object.fromEntries(
      YEARS.map((year) => [year, col(`${year} Population`)]),
    ) as Record<(typeof YEARS)[number], number>,
  };

  const countries: {
    cca3: string;
    name: string;
    capital: string;
    continent: string;
    areaKm2: number;
    density: string;
    growthRate: string;
    worldPercentage: string;
  }[] = [];
  const populationRecords: {
    countryCca3: string;
    year: number;
    population: bigint;
  }[] = [];
  const seen = new Set<string>();

  lines.forEach((line, i) => {
    const row = parseCsvLine(line);
    if (row.length !== header.length) {
      throw new Error(`Línea ${i + 2}: ${row.length} columnas, se esperaban ${header.length}`);
    }
    const cca3 = row[cols.cca3];
    if (!/^[A-Z]{3}$/.test(cca3)) throw new Error(`Línea ${i + 2}: CCA3 inválido "${cca3}"`);
    if (seen.has(cca3)) throw new Error(`Línea ${i + 2}: CCA3 duplicado "${cca3}"`);
    seen.add(cca3);

    countries.push({
      cca3,
      name: row[cols.name],
      capital: row[cols.capital],
      continent: row[cols.continent],
      areaKm2: Number(row[cols.area]),
      density: row[cols.density],
      growthRate: row[cols.growthRate],
      worldPercentage: row[cols.worldPercentage],
    });
    for (const year of YEARS) {
      populationRecords.push({
        countryCca3: cca3,
        year,
        population: BigInt(row[cols.population[year]]),
      });
    }
  });

  return { countries, populationRecords };
}

async function main() {
  const logger = new Logger('Seed');
  const { countries, populationRecords } = readDataset();
  logger.log(
    `CSV válido: ${countries.length} países, ${populationRecords.length} registros de población`,
  );

  const app = await NestFactory.createApplicationContext(SeedModule, {
    logger: ['error', 'warn'],
  });
  try {
    const prisma = app.get(PrismaService);

    const insertedCountries = await prisma.country.createMany({
      data: countries,
      skipDuplicates: true,
    });
    const insertedRecords = await prisma.populationRecord.createMany({
      data: populationRecords,
      skipDuplicates: true,
    });
    logger.log(
      `Insertados: ${insertedCountries.count} países, ${insertedRecords.count} registros`,
    );

    const [totalCountries, totalRecords] = await Promise.all([
      prisma.country.count(),
      prisma.populationRecord.count(),
    ]);
    if (
      totalCountries !== countries.length ||
      totalRecords !== populationRecords.length
    ) {
      throw new Error(
        `Conteos inesperados en la base de datos: ${totalCountries} países (esperados ${countries.length}), ${totalRecords} registros (esperados ${populationRecords.length})`,
      );
    }
    logger.log(`Verificado: ${totalCountries} países, ${totalRecords} registros en la base de datos`);
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
