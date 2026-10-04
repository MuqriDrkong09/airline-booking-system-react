import type {
  AdminAirport,
  AdminAirportFilters,
  AdminAirportInput,
} from '../types/adminAirport';
import { filterAdminAirports, sortAdminAirports } from '../utils/filterAdminAirports';
import { cloneAdminAirport } from '../utils/formatAdminAirport';
import type { AdminAirportsApi } from './adminAirportsApi.types';
import { createSeedAdminAirports } from './adminAirportsData';

const MOCK_DELAY_MS = process.env.NODE_ENV === 'test' ? 0 : 250;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function createMockAdminAirportsApi(
  options: { delayMs?: number; initialAirports?: AdminAirport[] } = {},
): AdminAirportsApi & {
  reset: () => void;
  getState: () => AdminAirport[];
} {
  const delayMs = options.delayMs ?? MOCK_DELAY_MS;
  let airports = (options.initialAirports ?? createSeedAdminAirports()).map(cloneAdminAirport);
  let nextId = airports.length + 1;

  return {
    reset() {
      airports = (options.initialAirports ?? createSeedAdminAirports()).map(cloneAdminAirport);
      nextId = airports.length + 1;
    },
    getState() {
      return airports.map(cloneAdminAirport);
    },
    async listAirports(filters?: AdminAirportFilters): Promise<AdminAirport[]> {
      await delay(delayMs);
      const source = sortAdminAirports(airports.map(cloneAdminAirport));
      if (!filters) {
        return source;
      }
      return filterAdminAirports(source, filters);
    },
    async getAirport(airportId: string): Promise<AdminAirport> {
      await delay(delayMs);
      const airport = airports.find((item) => item.id === airportId);
      if (!airport) {
        throw new Error('Airport not found');
      }
      return cloneAdminAirport(airport);
    },
    async createAirport(input: AdminAirportInput): Promise<AdminAirport> {
      await delay(delayMs);
      const codeTaken = airports.some(
        (item) => item.code.toUpperCase() === input.code.toUpperCase(),
      );
      if (codeTaken) {
        throw new Error('An airport with this code already exists');
      }
      const created: AdminAirport = {
        ...input,
        id: `airport-admin-${nextId}`,
      };
      nextId += 1;
      airports = [created, ...airports];
      return cloneAdminAirport(created);
    },
    async updateAirport(airportId: string, input: AdminAirportInput): Promise<AdminAirport> {
      await delay(delayMs);
      const index = airports.findIndex((item) => item.id === airportId);
      if (index < 0) {
        throw new Error('Airport not found');
      }
      const codeTaken = airports.some(
        (item, itemIndex) =>
          itemIndex !== index && item.code.toUpperCase() === input.code.toUpperCase(),
      );
      if (codeTaken) {
        throw new Error('An airport with this code already exists');
      }
      const updated: AdminAirport = {
        ...airports[index]!,
        ...input,
        id: airportId,
      };
      airports = airports.map((item, itemIndex) => (itemIndex === index ? updated : item));
      return cloneAdminAirport(updated);
    },
    async setAirportActive(airportId: string, active: boolean): Promise<AdminAirport> {
      await delay(delayMs);
      const index = airports.findIndex((item) => item.id === airportId);
      if (index < 0) {
        throw new Error('Airport not found');
      }
      const updated: AdminAirport = {
        ...airports[index]!,
        active,
      };
      airports = airports.map((item, itemIndex) => (itemIndex === index ? updated : item));
      return cloneAdminAirport(updated);
    },
    async deleteAirport(airportId: string): Promise<void> {
      await delay(delayMs);
      const exists = airports.some((item) => item.id === airportId);
      if (!exists) {
        throw new Error('Airport not found');
      }
      airports = airports.filter((item) => item.id !== airportId);
    },
  };
}

export const mockAdminAirportsApi = createMockAdminAirportsApi();
