import type { AxiosInstance } from 'axios';
import type { FlightsApi } from '@/features/flights/api/flightsApi.types';
import type { FlightStatusApi } from '@/features/flights/api/flightStatusApi.types';
import type {
  FlightOffer,
  FlightSearchRequest,
  FlightSearchResponse,
} from '@/features/flights/types/flight';
import type {
  FlightStatusLookupRequest,
  FlightStatusRecord,
} from '@/features/flights/types/flightStatus';
import { API_ENDPOINTS, apiClient, toApiError } from '@/services/api';

export function createHttpFlightApi(client: AxiosInstance = apiClient): FlightsApi {
  return {
    async searchFlights(request: FlightSearchRequest): Promise<FlightSearchResponse> {
      try {
        const { data } = await client.get<FlightSearchResponse>(API_ENDPOINTS.flights.search, {
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
      } catch (error) {
        throw toApiError(error);
      }
    },

    async getFlightById(
      flightId: string,
      context?: Partial<FlightSearchRequest> | null,
    ): Promise<FlightOffer | null> {
      try {
        const { data } = await client.get<FlightOffer | null>(
          API_ENDPOINTS.flights.byId(flightId),
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
      } catch (error) {
        const apiError = toApiError(error);
        if (apiError.status === 404) {
          return null;
        }
        throw apiError;
      }
    },
  };
}

export function createHttpFlightStatusApi(
  client: AxiosInstance = apiClient,
): FlightStatusApi {
  return {
    async lookupFlightStatus(
      request: FlightStatusLookupRequest,
    ): Promise<FlightStatusRecord | null> {
      try {
        const { data } = await client.get<FlightStatusRecord | null>(
          API_ENDPOINTS.flights.status,
          {
            params: {
              flightNumber: request.flightNumber,
              date: request.date,
            },
          },
        );
        return data;
      } catch (error) {
        const apiError = toApiError(error);
        if (apiError.status === 404) {
          return null;
        }
        throw apiError;
      }
    },
  };
}
