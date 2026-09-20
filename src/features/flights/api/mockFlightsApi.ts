import type { FlightSearchRequest, FlightSearchResponse } from '../types/flight';
import type { FlightsApi } from './flightsApi.types';
import { generateMockFlightOffers } from './flightsData';

const MOCK_DELAY_MS = 350;

function delay(ms = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function createMockFlightsApi(options: { delayMs?: number } = {}): FlightsApi {
  const delayMs = options.delayMs ?? MOCK_DELAY_MS;

  return {
    async searchFlights(request: FlightSearchRequest): Promise<FlightSearchResponse> {
      await delay(delayMs);

      // Deterministic error fixture for UI/tests.
      if (request.from.trim().toUpperCase() === 'ERR') {
        throw new Error('Unable to search flights right now. Please try again.');
      }

      const flights = generateMockFlightOffers(request);

      return {
        flights,
        currency: flights[0]?.price.currency ?? 'MYR',
        searchedAt: new Date().toISOString(),
      };
    },
  };
}

export const mockFlightsApi = createMockFlightsApi();
