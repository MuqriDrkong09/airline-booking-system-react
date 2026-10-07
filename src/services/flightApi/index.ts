import { env } from '@/config/env';
import type { FlightsApi } from '@/features/flights/api/flightsApi.types';
import type { FlightStatusApi } from '@/features/flights/api/flightStatusApi.types';
import { mockFlightsApi } from '@/features/flights/api/mockFlightsApi';
import { mockFlightStatusApi } from '@/features/flights/api/mockFlightStatusApi';
import { createHttpFlightApi, createHttpFlightStatusApi } from './httpFlightApi';

/**
 * Domain service: flights + flight status.
 */
export const flightApi: FlightsApi = env.useMockAuth
  ? mockFlightsApi
  : createHttpFlightApi();

export const flightStatusApi: FlightStatusApi = env.useMockAuth
  ? mockFlightStatusApi
  : createHttpFlightStatusApi();

export { createHttpFlightApi, createHttpFlightStatusApi };
export type { FlightsApi, FlightStatusApi };
