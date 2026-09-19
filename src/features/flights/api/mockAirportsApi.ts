import type { Airport, AirportSearchParams } from '../types';
import type { AirportsApi } from './airportsApi.types';
import { MOCK_AIRPORTS } from './airportsData';

const MOCK_DELAY_MS = 200;

function delay(ms = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function matchesAirport(airport: Airport, query: string): boolean {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return true;
  }

  return (
    normalize(airport.code).includes(normalizedQuery) ||
    normalize(airport.name).includes(normalizedQuery) ||
    normalize(airport.city).includes(normalizedQuery) ||
    normalize(airport.country).includes(normalizedQuery)
  );
}

function filterAirports(
  airports: readonly Airport[],
  { query = '', activeOnly = true, limit }: AirportSearchParams,
): Airport[] {
  let results = airports.filter((airport) => {
    if (activeOnly && !airport.active) {
      return false;
    }
    return matchesAirport(airport, query);
  });

  results = [...results].sort((left, right) => {
    const leftCode = normalize(left.code);
    const rightCode = normalize(right.code);
    const normalizedQuery = normalize(query);

    if (normalizedQuery) {
      const leftExact = leftCode === normalizedQuery ? 0 : 1;
      const rightExact = rightCode === normalizedQuery ? 0 : 1;
      if (leftExact !== rightExact) {
        return leftExact - rightExact;
      }

      const leftStarts = leftCode.startsWith(normalizedQuery) ? 0 : 1;
      const rightStarts = rightCode.startsWith(normalizedQuery) ? 0 : 1;
      if (leftStarts !== rightStarts) {
        return leftStarts - rightStarts;
      }
    }

    return left.city.localeCompare(right.city) || left.code.localeCompare(right.code);
  });

  if (typeof limit === 'number' && limit >= 0) {
    results = results.slice(0, limit);
  }

  return results;
}

export function createMockAirportsApi(airports: readonly Airport[] = MOCK_AIRPORTS): AirportsApi {
  return {
    async getAirports(params = {}): Promise<Airport[]> {
      await delay();
      return filterAirports(airports, { activeOnly: params.activeOnly ?? false, query: '' });
    },

    async getAirportByCode(code: string): Promise<Airport | null> {
      await delay(120);
      const normalizedCode = normalize(code);
      return airports.find((airport) => normalize(airport.code) === normalizedCode) ?? null;
    },

    async searchAirports(params: AirportSearchParams): Promise<Airport[]> {
      await delay();
      return filterAirports(airports, {
        query: params.query ?? '',
        activeOnly: params.activeOnly ?? true,
        limit: params.limit ?? 20,
      });
    },
  };
}

export const mockAirportsApi = createMockAirportsApi();
