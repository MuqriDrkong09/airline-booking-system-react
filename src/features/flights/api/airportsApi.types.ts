import type { Airport, AirportSearchParams } from '../types';

export interface AirportsApi {
  getAirports: (params?: Pick<AirportSearchParams, 'activeOnly'>) => Promise<Airport[]>;
  getAirportByCode: (code: string) => Promise<Airport | null>;
  searchAirports: (params: AirportSearchParams) => Promise<Airport[]>;
}
