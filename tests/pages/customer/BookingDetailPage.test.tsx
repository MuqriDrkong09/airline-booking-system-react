import { act, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import type { Booking } from '@/features/booking';
import { useBookingsStore } from '@/features/booking';
import type { FlightOffer } from '@/features/flights';
import { BookingDetailPage } from '@/pages/customer/BookingDetailPage';
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
    policies: {
      refundPolicy: 'Full refund up to 24 hours before departure.',
      changePolicy: 'Changes allowed with a fee.',
      fareConditions: ['Non-transferable'],
    },
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
    seats: [{ passengerId: 'p1', seatId: '12A', label: '12A', price: 25 }],
    baggage: [{ passengerId: 'p1', cabinKg: 7, checkedKg: 20, additionalKg: 0 }],
    meals: [{ passengerId: 'p1', mealType: null, quantity: 0 }],
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
      seatCost: 25,
      baggageCost: 0,
      mealCost: 0,
      addonCost: 0,
      subtotal: 225,
      discount: 0,
      taxes: 20,
      finalTotal: 245,
    },
    transactionId: 'TXN-DETAIL-1',
    ...rest,
    flight,
  };
}

function renderDetail(path: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/app/bookings/:bookingReference" element={<BookingDetailPage />} />
    </Routes>,
    { initialEntries: [path] },
  );
}

describe('BookingDetailPage', () => {
  beforeEach(async () => {
    act(() => {
      useBookingsStore.getState().clearBookings();
    });
    await act(async () => {
      await useBookingsStore.persist.rehydrate();
    });
  });

  it('shows an error state for an invalid booking reference', () => {
    renderDetail('/app/bookings/@@@');

    expect(screen.getByRole('heading', { name: 'Invalid booking reference' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('shows not-found when the booking is missing', () => {
    renderDetail('/app/bookings/AB-MISSING');

    expect(screen.getByRole('heading', { name: 'Booking not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'My bookings' })).toBeInTheDocument();
  });

  it('renders complete booking detail sections', () => {
    act(() => {
      useBookingsStore.getState().saveBooking(
        makeBooking({ reference: 'AB-DETAIL1', status: 'CONFIRMED' }),
      );
    });

    renderDetail('/app/bookings/AB-DETAIL1');

    const sectionTitles = [
      'Booking information',
      'Flight',
      'Passengers',
      'Seats',
      'Baggage',
      'Meals',
      'Add-ons',
      'Payment',
      'Cancellation policy',
    ];

    for (const title of sectionTitles) {
      expect(screen.getAllByText(title).length).toBeGreaterThan(0);
    }

    expect(screen.getByText('AB-DETAIL1')).toBeInTheDocument();
    expect(screen.getByText(/AeroBook Air AB100/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Ms Ada Lovelace/i).length).toBeGreaterThan(0);
    expect(screen.getByText('12A')).toBeInTheDocument();
    expect(screen.getByText(/Full refund up to 24 hours/i)).toBeInTheDocument();
    expect(screen.getByText(/Refundable fare/i)).toBeInTheDocument();
  });
});
