import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, Matches } from 'class-validator';
import { MAX_HISTORY_COUNTRIES } from '../demographics.constants';

// Acepta `countries=MEX,USA` y `countries=MEX&countries=USA`.
const parseCountries = ({ value }: { value: unknown }) => {
  if (value === undefined) return value;
  const raw: unknown[] = Array.isArray(value) ? value : [value];
  const codes = raw
    .flatMap((item) => String(item).split(','))
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean);
  return [...new Set(codes)];
};

// class-validator evalúa los decoradores de abajo hacia arriba; con
// stopAtFirstError, IsArray debe ir al final para reportarse primero.
export class PopulationHistoryQueryDto {
  @ApiProperty({
    description:
      'Códigos CCA3 separados por coma o parámetro repetido (máx. 50)',
    type: String,
    example: 'MEX,USA,FRA',
  })
  @Transform(parseCountries)
  @Matches(/^[A-Z]{3}$/, {
    each: true,
    message: 'Cada código de país debe tener 3 letras (CCA3)',
  })
  @ArrayMaxSize(MAX_HISTORY_COUNTRIES, {
    message: `countries admite como máximo ${MAX_HISTORY_COUNTRIES} códigos`,
  })
  @ArrayMinSize(1, { message: 'countries debe incluir al menos un código' })
  @IsArray({ message: 'countries es obligatorio (ej. countries=MEX,USA)' })
  countries: string[];
}
