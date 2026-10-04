import type { FlightOperationalStatus } from '@/features/flights';
import type {
  AdminFlight,
  AdminFlightFilters,
  AdminFlightInput,
} from '../types/adminFlight';
import { filterAdminFlights } from '../utils/filterAdminFlights';
import { sortAdminFlights } from '../utils/formatAdminFlight';
import type { AdminFlightsApi } from './adminFlightsApi.types';
import { createSeedAdminFlights } from './adminFlightsData';

const MOCK_DELAY_MS = process.env.NODE_ENV === 'test' ? 0 : 250;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function cloneFlight(flight: AdminFlight): AdminFlight {
  return {
    ...flight,
    fareClasses: [...flight.fareClasses],
  };
}

export function createMockAdminFlightsApi(
  options: { delayMs?: number; initialFlights?: AdminFlight[] } = {},
): AdminFlightsApi & {
  reset: () => void;
  getState: () => AdminFlight[];
} {
  const delayMs = options.delayMs ?? MOCK_DELAY_MS;
  let flights = (options.initialFlights ?? createSeedAdminFlights()).map(cloneFlight);
  let nextId = flights.length + 1;

  return {
    reset() {
      flights = (options.initialFlights ?? createSeedAdminFlights()).map(cloneFlight);
      nextId = flights.length + 1;
    },
    getState() {
      return flights.map(cloneFlight);
    },
    async listFlights(filters?: AdminFlightFilters): Promise<AdminFlight[]> {
      await delay(delayMs);
      const source = sortAdminFlights(flights.map(cloneFlight));
      if (!filters) {
        return source;
      }
      return filterAdminFlights(source, filters);
    },
    async getFlight(flightId: string): Promise<AdminFlight> {
      await delay(delayMs);
      const flight = flights.find((item) => item.id === flightId);
      if (!flight) {
        throw new Error('Flight not found');
      }
      return cloneFlight(flight);
    },
    async createFlight(input: AdminFlightInput): Promise<AdminFlight> {
      await delay(delayMs);
      const now = new Date().toISOString();
      const created: AdminFlight = {
        ...input,
        fareClasses: [...input.fareClasses],
        id: `adm-flight-${nextId}`,
        createdAt: now,
        updatedAt: now,
      };
      nextId += 1;
      flights = [created, ...flights];
      return cloneFlight(created);
    },
    async updateFlight(flightId: string, input: AdminFlightInput): Promise<AdminFlight> {
      await delay(delayMs);
      const index = flights.findIndex((item) => item.id === flightId);
      if (index < 0) {
        throw new Error('Flight not found');
      }
      const current = flights[index]!;
      const updated: AdminFlight = {
        ...current,
        ...input,
        fareClasses: [...input.fareClasses],
        id: current.id,
        createdAt: current.createdAt,
        updatedAt: new Date().toISOString(),
      };
      flights = flights.map((item, itemIndex) => (itemIndex === index ? updated : item));
      return cloneFlight(updated);
    },
    async updateFlightStatus(
      flightId: string,
      status: FlightOperationalStatus,
    ): Promise<AdminFlight> {
      await delay(delayMs);
      const index = flights.findIndex((item) => item.id === flightId);
      if (index < 0) {
        throw new Error('Flight not found');
      }
      const current = flights[index]!;
      const updated: AdminFlight = {
        ...current,
        status,
        updatedAt: new Date().toISOString(),
      };
      flights = flights.map((item, itemIndex) => (itemIndex === index ? updated : item));
      return cloneFlight(updated);
    },
    async deleteFlight(flightId: string): Promise<void> {
      await delay(delayMs);
      const exists = flights.some((item) => item.id === flightId);
      if (!exists) {
        throw new Error('Flight not found');
      }
      flights = flights.filter((item) => item.id !== flightId);
    },
  };
}

export const mockAdminFlightsApi = createMockAdminFlightsApi();
