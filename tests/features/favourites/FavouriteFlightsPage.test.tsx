import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { queryClient } from '@/app/providers/queryClient';
import {
  FavouriteButton,
  FavouriteFlightCard,
  favouriteKeys,
  mockFavouritesApi,
} from '@/features/favourites';
import type { FlightOffer } from '@/features/flights';
import { FavouriteFlightsPage } from '@/pages/customer/FavouriteFlightsPage';
import { renderWithProviders } from '@tests/utils/test-utils';

const flight = {
  id: 'FL-FAV-1',
  airline: { code: 'AK', name: 'AirAsia' },
  flightNumber: 'AK130',
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
  price: { amount: 99, currency: 'USD' },
  availableSeats: 12,
  refundable: true,
  baggageIncluded: true,
} as FlightOffer;

function resetFavouritesTestState() {
  mockFavouritesApi.reset();
  localStorage.removeItem('aerobook-favourites');
  queryClient.removeQueries({ queryKey: favouriteKeys.all });
}

describe('FavouriteButton', () => {
  beforeEach(() => {
    resetFavouritesTestState();
  });

  it('adds and removes a flight from favourites', async () => {
    const user = userEvent.setup();

    renderWithProviders(<FavouriteButton flight={flight} />);

    const addButton = await screen.findByRole('button', { name: /Add to favourites/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Remove from favourites/i })).toBeInTheDocument();
    });
    expect(await mockFavouritesApi.isFavourite(flight.id)).toBe(true);

    await user.click(screen.getByRole('button', { name: /Remove from favourites/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add to favourites/i })).toBeInTheDocument();
    });
    expect(await mockFavouritesApi.isFavourite(flight.id)).toBe(false);
  });
});

describe('FavouriteFlightCard', () => {
  beforeEach(() => {
    resetFavouritesTestState();
  });

  it('removes a favourite from the card actions', async () => {
    const user = userEvent.setup();
    await mockFavouritesApi.addFavourite(flight);

    renderWithProviders(<FavouriteFlightCard flight={flight} />);

    expect(screen.getByText('AirAsia')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View details/i })).toHaveAttribute(
      'href',
      `/app/flights/${flight.id}`,
    );

    await user.click(screen.getByRole('button', { name: /^Remove$/i }));

    await waitFor(async () => {
      expect(await mockFavouritesApi.isFavourite(flight.id)).toBe(false);
    });
  });
});

describe('FavouriteFlightsPage', () => {
  beforeEach(() => {
    resetFavouritesTestState();
  });

  it('shows an empty state when there are no favourites', async () => {
    renderWithProviders(<FavouriteFlightsPage />, {
      initialEntries: ['/app/favourites'],
    });

    expect(await screen.findByRole('heading', { name: 'Favourite flights' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /No favourite flights yet/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Search flights/i }).length).toBeGreaterThan(0);
  });

  it('lists saved favourite flights', async () => {
    await mockFavouritesApi.addFavourite(flight);

    renderWithProviders(<FavouriteFlightsPage />, {
      initialEntries: ['/app/favourites'],
    });

    expect(await screen.findByText('AirAsia')).toBeInTheDocument();
    expect(screen.getByText('AK130')).toBeInTheDocument();
  });
});
