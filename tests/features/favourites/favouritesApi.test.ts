import {
  createMockFavouritesApi,
  mockFavouritesApi,
  sortFavouritesByNewest,
} from '@/features/favourites';
import type { FlightOffer } from '@/features/flights';

const flightA = {
  id: 'FL-A',
  airline: { code: 'AK', name: 'AirAsia' },
  flightNumber: 'AK100',
  aircraft: { model: 'A320' },
  origin: { code: 'KUL', city: 'Kuala Lumpur', airportName: 'KLIA' },
  destination: { code: 'PEN', city: 'George Town', airportName: 'PEN' },
  departureTime: '2026-10-20T09:00',
  arrivalTime: '2026-10-20T10:05',
  durationMinutes: 65,
  stops: 0,
  stopAirports: [],
  cabinClass: 'ECONOMY',
  baggage: { cabinKg: 7, checkedKg: 20, pieces: 1 },
  amenities: { meals: '', wifi: false, wifiNotes: '', seatInformation: '' },
  policies: { refundPolicy: '', changePolicy: '', fareConditions: [] },
  segments: [],
  price: { amount: 120, currency: 'USD' },
  availableSeats: 8,
  refundable: true,
  baggageIncluded: true,
} as FlightOffer;

const flightB = {
  ...flightA,
  id: 'FL-B',
  flightNumber: 'AK200',
} as FlightOffer;

describe('favourites API', () => {
  beforeEach(() => {
    mockFavouritesApi.reset();
    localStorage.removeItem('aerobook-favourites');
  });

  it('adds, lists, checks, and removes favourites', async () => {
    const api = createMockFavouritesApi({ delayMs: 0, persist: false });

    const added = await api.addFavourite(flightA);
    expect(added.flight.id).toBe('FL-A');
    expect(await api.isFavourite('FL-A')).toBe(true);

    const again = await api.addFavourite(flightA);
    expect(again.id).toBe(added.id);

    await api.addFavourite(flightB);
    const list = await api.listFavourites();
    expect(list.map((item) => item.flight.id)).toEqual(['FL-B', 'FL-A']);

    await api.removeFavourite('FL-A');
    expect(await api.isFavourite('FL-A')).toBe(false);
    expect((await api.listFavourites()).map((item) => item.flight.id)).toEqual(['FL-B']);
  });

  it('persists favourites to localStorage in mock mode', async () => {
    const api = createMockFavouritesApi({ delayMs: 0, persist: true });
    api.reset();

    await api.addFavourite(flightA);

    const reloaded = createMockFavouritesApi({ delayMs: 0, persist: true });
    expect(await reloaded.isFavourite('FL-A')).toBe(true);
  });

  it('throws when removing a missing favourite', async () => {
    const api = createMockFavouritesApi({ delayMs: 0, persist: false });
    await expect(api.removeFavourite('missing')).rejects.toThrow(/not found/i);
  });

  it('sorts favourites newest first', () => {
    const sorted = sortFavouritesByNewest([
      {
        id: 'fav-1',
        flight: flightA,
        savedAt: '2026-10-01T10:00:00.000Z',
      },
      {
        id: 'fav-2',
        flight: flightB,
        savedAt: '2026-10-01T12:00:00.000Z',
      },
    ]);

    expect(sorted.map((item) => item.id)).toEqual(['fav-2', 'fav-1']);
  });
});
