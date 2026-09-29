import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Booking } from '@/features/booking';
import { useBookingsStore } from '@/features/booking';
import type { FlightOffer } from '@/features/flights';
import { MyBookingsPage } from '@/pages/customer/MyBookingsPage';
import { renderWithProviders } from '../../utils/test-utils';

function makeBooking(
  overrides: Partial<Omit<Booking, 'flight' | 'reference' | 'status'>> & {
    reference: string;
    status: Booking['status'];
    flight?: Partial<FlightOffer>;
  },
): Booking {
  const flight = {
    id: 'FL-100',
    airline: { code: 'AB', name: 'AeroBook Air' },
    flightNumber: 'AB100',
    aircraft: { model: 'A320' },
    origin: { code: 'KUL', city: 'Kuala Lumpur', airportName: 'KLIA' },
    destination: { code: 'NRT', city: 'Tokyo', airportName: 'Narita' },
    departureTime: '2099-10-20T09:00',
    arrivalTime: '2099-10-20T17:00',
    durationMinutes: 420,
    stops: 0,
    stopAirports: [],
    cabinClass: 'ECONOMY',
    baggage: { cabinKg: 7, checkedKg: 20, pieces: 1 },
    amenities: { meals: '', wifi: false, wifiNotes: '', seatInformation: '' },
    policies: { refundPolicy: '', changePolicy: '', fareConditions: [] },
    segments: [],
    price: { amount: 200, currency: 'USD' },
    availableSeats: 10,
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
        firstName: 'Ada',
        lastName: 'Lovelace',
        dateOfBirth: '1990-01-01',
        gender: 'FEMALE',
        nationality: 'MY',
        passportNumber: 'A123',
        passportExpiry: '2030-01-01',
        email: 'ada@example.com',
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
      billingName: 'Ada',
      billingEmail: 'ada@example.com',
      cardBrand: 'visa',
      cardLast4: '1111',
    },
    priceBreakdown: {
      currency: 'USD',
      baseFare: 200,
      seatCost: 0,
      baggageCost: 0,
      mealCost: 0,
      addonCost: 0,
      subtotal: 200,
      discount: 0,
      taxes: 20,
      finalTotal: 220,
    },
    transactionId: 'TXN-1',
    ...rest,
    flight,
  };
}

describe('MyBookingsPage', () => {
  beforeEach(() => {
    act(() => {
      useBookingsStore.getState().clearBookings();
    });
  });

  it('shows empty state when there are no bookings', () => {
    renderWithProviders(<MyBookingsPage />, { initialEntries: ['/app/bookings'] });

    expect(screen.getByRole('heading', { name: 'No bookings yet' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Search flights' }).length).toBeGreaterThan(0);
  });

  it('lists upcoming bookings with card details and actions', async () => {
    const user = userEvent.setup();

    act(() => {
      useBookingsStore.getState().saveBooking(
        makeBooking({
          reference: 'AB-LIST1',
          status: 'CONFIRMED',
          flight: {
            airline: { code: 'AK', name: 'AirAsia' },
            flightNumber: 'AK674',
            origin: { code: 'KUL', city: 'Kuala Lumpur', airportName: 'KLIA' },
            destination: { code: 'PEN', city: 'George Town', airportName: 'PEN' },
            departureTime: '2099-10-20T09:00',
          },
        }),
      );
      useBookingsStore.getState().saveBooking(
        makeBooking({
          reference: 'AB-OLD',
          status: 'COMPLETED',
          flight: { departureTime: '2020-01-01T09:00' },
        }),
      );
    });

    renderWithProviders(<MyBookingsPage />, { initialEntries: ['/app/bookings'] });

    expect(screen.getByRole('tab', { name: /Upcoming \(1\)/i })).toBeInTheDocument();
    expect(screen.getByText('AB-LIST1')).toBeInTheDocument();
    expect(screen.getByText(/AirAsia · AK674/i)).toBeInTheDocument();
    expect(screen.getByText(/KUL → PEN/i)).toBeInTheDocument();
    expect(screen.getByText(/1 passenger/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Manage' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Check-in' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download ticket' })).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /Past \(1\)/i }));
    expect(screen.getByText('AB-OLD')).toBeInTheDocument();
    expect(screen.queryByText('AB-LIST1')).not.toBeInTheDocument();
  });

  it('cancels a booking through the cancellation dialog flow', async () => {
    const user = userEvent.setup();

    act(() => {
      useBookingsStore.getState().saveBooking(
        makeBooking({ reference: 'AB-CXL', status: 'CONFIRMED' }),
      );
    });

    renderWithProviders(<MyBookingsPage />, { initialEntries: ['/app/bookings'] });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }));
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }));
    await user.click(within(dialog).getByRole('button', { name: 'Confirm cancellation' }));
    await user.click(within(dialog).getByRole('button', { name: 'Done' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('tab', { name: /Cancelled \(1\)/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('AB-CXL')).toBeInTheDocument();
    expect(useBookingsStore.getState().getBookingByReference('AB-CXL')?.status).toBe(
      'REFUNDED',
    );
  });
});
