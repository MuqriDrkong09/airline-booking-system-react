import type { FlightOffer } from '@/features/flights';
import type { FavouriteFlight } from '../types/favourite';
import { sortFavouritesByNewest } from '../types/favourite';
import type { FavouritesApi } from './favouritesApi.types';

const STORAGE_KEY = 'aerobook-favourites';
const MOCK_DELAY_MS = 200;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function readStorage(): FavouriteFlight[] {
  if (typeof localStorage === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as FavouriteFlight[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(favourites: FavouriteFlight[]): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
}

export function createMockFavouritesApi(
  options: { delayMs?: number; initial?: FavouriteFlight[]; persist?: boolean } = {},
): FavouritesApi & {
  reset: () => void;
  getState: () => FavouriteFlight[];
} {
  const delayMs = options.delayMs ?? MOCK_DELAY_MS;
  const persist = options.persist ?? true;
  let favourites = options.initial
    ? options.initial.map((item) => ({ ...item, flight: { ...item.flight } }))
    : persist
      ? readStorage()
      : [];

  const sync = () => {
    if (persist) {
      writeStorage(favourites);
    }
  };

  return {
    reset() {
      favourites = options.initial
        ? options.initial.map((item) => ({ ...item, flight: { ...item.flight } }))
        : [];
      sync();
    },

    getState() {
      return favourites.map((item) => ({ ...item, flight: { ...item.flight } }));
    },

    async listFavourites(): Promise<FavouriteFlight[]> {
      await delay(delayMs);
      return sortFavouritesByNewest(favourites);
    },

    async addFavourite(flight: FlightOffer): Promise<FavouriteFlight> {
      await delay(delayMs);
      const existing = favourites.find((item) => item.flight.id === flight.id);
      if (existing) {
        return { ...existing, flight: { ...existing.flight } };
      }

      const next: FavouriteFlight = {
        id: `fav-${flight.id}`,
        flight: { ...flight },
        savedAt: new Date().toISOString(),
      };
      favourites = [next, ...favourites];
      sync();
      return { ...next, flight: { ...next.flight } };
    },

    async removeFavourite(flightId: string): Promise<void> {
      await delay(delayMs);
      const next = favourites.filter((item) => item.flight.id !== flightId);
      if (next.length === favourites.length) {
        throw new Error('Favourite not found.');
      }
      favourites = next;
      sync();
    },

    async isFavourite(flightId: string): Promise<boolean> {
      await delay(delayMs);
      return favourites.some((item) => item.flight.id === flightId);
    },
  };
}

export const mockFavouritesApi = createMockFavouritesApi();
