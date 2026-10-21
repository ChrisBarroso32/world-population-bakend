export interface CountryResponse {
  cca3: string;
  name: string;
  capital: string;
  continent: string;
  areaKm2: number;
  density: number;
  growthRate: number;
  worldPercentage: number;
  population: number | null;
}

export interface PopulationPoint {
  year: number;
  population: number;
}

export interface PopulationHistoryResponse {
  cca3: string;
  name: string;
  continent: string;
  series: PopulationPoint[];
}

export interface ContinentSummaryResponse {
  continent: string;
  totalPopulation: number;
  countryCount: number;
  percentage: number;
}
