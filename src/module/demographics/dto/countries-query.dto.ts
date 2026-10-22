import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() || undefined : value;

export class CountriesQueryDto {
  @ApiPropertyOptional({
    description:
      'Nombre parcial (sin distinguir mayúsculas) o código CCA3 exacto',
    example: 'MEX',
    maxLength: 100,
  })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    description: 'Continente exacto (sin distinguir mayúsculas)',
    example: 'North America',
    maxLength: 30,
  })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(30)
  continent?: string;
}
