import { act, screen, waitFor } from '@testing-library/react';
import type { Booking } from '@/features/booking';
import { useBookingsStore } from '@/features/booking';
import { favouriteKeys } from '@/features/favourites';
import type { FlightOffer } from '@/features/flights';
import { notificationKeys } from '@/features/notifications';
import { queryClient } from '@/app/providers/queryClient';
import { CustomerHomePage } from '@/pages/customer/CustomerHomePage';
import { renderWithProviders } from '@tests/utils/test-utils';
import {
  mockCustomerUser,
  resetAuthStore,
  seedAuthenticatedUser,
} from '@tests/utils/authTestUtils';

function makeBooking(
  overrides: Partial<Omit<Booking, 'flight' | 'reference' | 'status'>> & {
    reference: string;
    status: Booking['status'];
    flight?: Partial<FlightOffer>;
  },
): Booking {
  const flight = {
    id: 'FL-HOME',
    airline: { code: 'AB', name: 'AeroBook Air' },
    flightNumber: 'AB200',
    aircraft: { model: 'A320' },
    origin: { code: 'KUL', city: 'Kuala Lumpur', airportName: 'KLIA' },
    destination: { code: 'SIN', city: 'Singapore', airportName: 'Changi' },
    departureTime: '2099-11-01T08:00',
    arrivalTime: '2099-11-01T11:00',
    durationMinutes: 180,
    stops: 0,
    stopAirports: [],
    cabinClass: 'ECONOMY',
    baggage: { cabinKg: 7, checkedKg: 20, pieces: 1 },
    amenities: { meals: '', wifi: false, wifiNotes: '', seatInformation: '' },
    policies: { refundPolicy: '', changePolicy: '', fareConditions: [] },
    segments: [],
    price: { amount: 150, currency: 'USD' },
    availableSeats: 12,
    refundable: true,
    baggageIncluded: true,
    ...overrides.flight,
  } as FlightOffer;

  const { flight: _flight, ...rest } = overrides;

  return {
    id: `id-${overrides.reference}`,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
    flightId: flight.id,
    cabinClass: 'ECONOMY',
    searchCriteria: null,
    passengers: [
      {
        id: 'p1',
        type: 'ADULT',
        title: 'Ms',
        firstName: 'Alex',
        lastName: 'Traveler',
        dateOfBirth: '1990-01-01',
        gender: 'FEMALE',
        nationality: 'MY',
        passportNumber: 'A123',
        passportExpiry: '2030-01-01',
        email: 'alex@example.com',
        phone: '+60123456789',
        associatedAdultId: '',
      },
    ],
    seats: [],
    baggage: [],
    meals: [],
    addons: [],
    promoCode: null,
    payment: {
      method: 'CREDIT_CARD',
      billingName: 'Alex',
      billingEmail: 'alex@example.com',
      cardBrand: 'visa',
      cardLast4: '1111',
    },
    priceBreakdown: {
      currency: 'USD',
      baseFare: 150,
      seatCost: 0,
      baggageCost: 0,
      mealCost: 0,
      addonCost: 0,
      subtotal: 150,
      discount: 0,
      taxes: 15,
      finalTotal: 165,
    },
    transactionId: 'TXN-HOME',
    ...rest,
    flight,
  };
}

describe('CustomerHomePage', () => {
  beforeEach(() => {
    resetAuthStore();
    seedAuthenticatedUser(mockCustomerUser);
    act(() => {
      useBookingsStore.getState().clearBookings();
    });
    queryClient.removeQueries({ queryKey: favouriteKeys.all });
    queryClient.removeQueries({ queryKey: notificationKeys.all });
  });

  it('renders welcome, stats, quick actions, and empty upcoming trips', async () => {
    renderWithProviders(<CustomerHomePage />, {
      initialEntries: ['/app'],
    });

    expect(await screen.findByRole('heading', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Welcome back, Alex Traveler/i })).toBeInTheDocument();

    expect(screen.getByText('Check-in ready')).toBeInTheDocument();
    expect(screen.getByText('Unread alerts')).toBeInTheDocument();
    expect(screen.getByText('Ready to travel')).toBeInTheDocument();
    expect(screen.getByText('Saved flight offers')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Quick actions' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Upcoming trips' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open search flights/i })).toHaveAttribute(
      'href',
      '/app/flights',
    );
    expect(screen.getByRole('link', { name: /open my bookings/i })).toHaveAttribute(
      'href',
      '/app/bookings',
    );

    expect(await screen.findByRole('heading', { name: 'No upcoming trips' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Search flights' }).length).toBeGreaterThan(0);
  });

  it('lists upcoming bookings on the home preview', async () => {
    act(() => {
      useBookingsStore.getState().saveBooking(
        makeBooking({
          reference: 'AB-HOME1',
          status: 'CONFIRMED',
        }),
      );
    });

    renderWithProviders(<CustomerHomePage />, {
      initialEntries: ['/app'],
    });

    expect(await screen.findByText('AB-HOME1')).toBeInTheDocument();
    expect(screen.getByText(/KUL → SIN/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'No upcoming trips' })).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Showing 1 of 1 upcoming')).toBeInTheDocument();
    });
  });
});
