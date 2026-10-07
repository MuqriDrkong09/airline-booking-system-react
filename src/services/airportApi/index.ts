import { env } from '@/config/env';
import type { AirportsApi } from '@/features/flights/api/airportsApi.types';
import { mockAirportsApi } from '@/features/flights/api/mockAirportsApi';
import { createHttpAirportApi } from './httpAirportApi';

/**
 * Domain service: airports.
 * Mock vs HTTP is selected via `VITE_USE_MOCK_AUTH`.
 */
export const airportApi: AirportsApi = env.useMockAuth
  ? mockAirportsApi
  : createHttpAirportApi();

export { createHttpAirportApi };
export type { AirportsApi };
