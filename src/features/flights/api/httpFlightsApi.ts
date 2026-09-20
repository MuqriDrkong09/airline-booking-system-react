import type { AxiosInstance } from 'axios';
import { apiClient } from '@/services/api/client';
import type { FlightOffer, FlightSearchRequest, FlightSearchResponse } from '../types/flight';
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

    async getFlightById(
      flightId: string,
      context?: Partial<FlightSearchRequest> | null,
    ): Promise<FlightOffer | null> {
      const { data } = await client.get<FlightOffer | null>(
        `/flights/${encodeURIComponent(flightId)}`,
        {
          params: {
            from: context?.from,
            to: context?.to,
            departure: context?.departure,
            return: context?.returnDate,
            adults: context?.adults,
            children: context?.children,
            infants: context?.infants,
            cabin: context?.cabinClass,
            trip: context?.tripType,
          },
        },
      );
      return data;
    },
  };
}
