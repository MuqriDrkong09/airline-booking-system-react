import type {
  FlightStatusLookupRequest,
  FlightStatusRecord,
} from '../types/flightStatus';
import type { FlightStatusApi } from './flightStatusApi.types';
import { generateMockFlightStatus, normalizeFlightNumber } from './flightStatusData';

const MOCK_DELAY_MS = 300;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function createMockFlightStatusApi(
  options: { delayMs?: number } = {},
): FlightStatusApi {
  const delayMs = options.delayMs ?? MOCK_DELAY_MS;

  return {
    async lookupFlightStatus(
      request: FlightStatusLookupRequest,
    ): Promise<FlightStatusRecord | null> {
      await delay(delayMs);

      const flightNumber = normalizeFlightNumber(request.flightNumber);

      // Deterministic error fixture for UI/tests.
      if (flightNumber === 'ERR1') {
        throw new Error('Unable to look up flight status right now. Please try again.');
      }

      return generateMockFlightStatus({
        flightNumber,
        date: request.date.trim(),
      });
    },
  };
}

export const mockFlightStatusApi = createMockFlightStatusApi();
