import type {
  AdminAircraft,
  AdminAircraftFilters,
  AdminAircraftInput,
} from '../types/adminAircraft';
import { filterAdminAircraft, sortAdminAircraft } from '../utils/filterAdminAircraft';
import { cloneAdminAircraft } from '../utils/formatAdminAircraft';
import { buildDefaultSeatMapConfig, sumCabinSeats } from '../utils/seatMapConfig';
import type { AdminAircraftApi } from './adminAircraftApi.types';
import { createSeedAdminAircraft } from './adminAircraftData';

const MOCK_DELAY_MS = process.env.NODE_ENV === 'test' ? 0 : 250;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function normalizeInput(input: AdminAircraftInput): AdminAircraftInput {
  const cabinTotal = sumCabinSeats(input);
  if (cabinTotal !== input.totalSeats) {
    throw new Error(`Total seats must equal cabin seats (${cabinTotal})`);
  }

  return {
    ...input,
    registration: input.registration.toUpperCase(),
    seatMapConfig: input.seatMapConfig ?? buildDefaultSeatMapConfig(input),
  };
}

export function createMockAdminAircraftApi(
  options: { delayMs?: number; initialAircraft?: AdminAircraft[] } = {},
): AdminAircraftApi & {
  reset: () => void;
  getState: () => AdminAircraft[];
} {
  const delayMs = options.delayMs ?? MOCK_DELAY_MS;
  let aircraftList = (options.initialAircraft ?? createSeedAdminAircraft()).map(cloneAdminAircraft);
  let nextId = aircraftList.length + 1;

  return {
    reset() {
      aircraftList = (options.initialAircraft ?? createSeedAdminAircraft()).map(cloneAdminAircraft);
      nextId = aircraftList.length + 1;
    },
    getState() {
      return aircraftList.map(cloneAdminAircraft);
    },
    async listAircraft(filters?: AdminAircraftFilters): Promise<AdminAircraft[]> {
      await delay(delayMs);
      const source = sortAdminAircraft(aircraftList.map(cloneAdminAircraft));
      if (!filters) {
        return source;
      }
      return filterAdminAircraft(source, filters);
    },
    async getAircraft(aircraftId: string): Promise<AdminAircraft> {
      await delay(delayMs);
      const aircraft = aircraftList.find((item) => item.id === aircraftId);
      if (!aircraft) {
        throw new Error('Aircraft not found');
      }
      return cloneAdminAircraft(aircraft);
    },
    async createAircraft(input: AdminAircraftInput): Promise<AdminAircraft> {
      await delay(delayMs);
      const normalized = normalizeInput(input);
      const registrationTaken = aircraftList.some(
        (item) => item.registration.toUpperCase() === normalized.registration,
      );
      if (registrationTaken) {
        throw new Error('An aircraft with this registration already exists');
      }
      const created: AdminAircraft = {
        ...normalized,
        id: `aircraft-admin-${nextId}`,
      };
      nextId += 1;
      aircraftList = [created, ...aircraftList];
      return cloneAdminAircraft(created);
    },
    async updateAircraft(
      aircraftId: string,
      input: AdminAircraftInput,
    ): Promise<AdminAircraft> {
      await delay(delayMs);
      const index = aircraftList.findIndex((item) => item.id === aircraftId);
      if (index < 0) {
        throw new Error('Aircraft not found');
      }
      const normalized = normalizeInput(input);
      const registrationTaken = aircraftList.some(
        (item, itemIndex) =>
          itemIndex !== index && item.registration.toUpperCase() === normalized.registration,
      );
      if (registrationTaken) {
        throw new Error('An aircraft with this registration already exists');
      }
      const updated: AdminAircraft = {
        ...aircraftList[index]!,
        ...normalized,
        id: aircraftId,
      };
      aircraftList = aircraftList.map((item, itemIndex) =>
        itemIndex === index ? updated : item,
      );
      return cloneAdminAircraft(updated);
    },
    async setAircraftActive(aircraftId: string, active: boolean): Promise<AdminAircraft> {
      await delay(delayMs);
      const index = aircraftList.findIndex((item) => item.id === aircraftId);
      if (index < 0) {
        throw new Error('Aircraft not found');
      }
      const updated: AdminAircraft = {
        ...aircraftList[index]!,
        active,
      };
      aircraftList = aircraftList.map((item, itemIndex) =>
        itemIndex === index ? updated : item,
      );
      return cloneAdminAircraft(updated);
    },
    async deleteAircraft(aircraftId: string): Promise<void> {
      await delay(delayMs);
      const exists = aircraftList.some((item) => item.id === aircraftId);
      if (!exists) {
        throw new Error('Aircraft not found');
      }
      aircraftList = aircraftList.filter((item) => item.id !== aircraftId);
    },
  };
}

export const mockAdminAircraftApi = createMockAdminAircraftApi();
