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

export class PopulationHistoryQueryDto {
  @Transform(parseCountries)
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_HISTORY_COUNTRIES)
  @Matches(/^[A-Z]{3}$/, {
    each: true,
    message: 'Cada código de país debe tener 3 letras (CCA3)',
  })
  countries: string[];
}
