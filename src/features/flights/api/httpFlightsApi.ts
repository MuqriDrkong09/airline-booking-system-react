import type { AxiosInstance } from 'axios';
import { apiClient } from '@/services/api/client';
import type { FlightSearchRequest, FlightSearchResponse } from '../types/flight';
import type { FlightsApi } from './flightsApi.types';

export function createHttpFlightsApi(client: AxiosInstance = apiClient): FlightsApi {
  return {
    async searchFlights(request: FlightSearchRequest): Promise<FlightSearchResponse> {
      const { data } = await client.get<FlightSearchResponse>('/flights/search', {
        params: {
          from: request.from,
          to: request.to,
          departure: request.departure,
          return: request.returnDate,
          adults: request.adults,
          children: request.children,
          infants: request.infants,
          cabin: request.cabinClass,
          trip: request.tripType,
        },
      });
      return data;
    },
  };
}
