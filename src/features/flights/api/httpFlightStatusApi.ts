import type { AxiosInstance } from 'axios';
import { apiClient } from '@/services/api/client';
import type {
  FlightStatusLookupRequest,
  FlightStatusRecord,
} from '../types/flightStatus';
import type { FlightStatusApi } from './flightStatusApi.types';

export function createHttpFlightStatusApi(
  client: AxiosInstance = apiClient,
): FlightStatusApi {
  return {
    async lookupFlightStatus(
      request: FlightStatusLookupRequest,
    ): Promise<FlightStatusRecord | null> {
      const { data } = await client.get<FlightStatusRecord | null>('/flights/status', {
        params: {
          flightNumber: request.flightNumber,
          date: request.date,
        },
      });
      return data;
    },
  };
}
