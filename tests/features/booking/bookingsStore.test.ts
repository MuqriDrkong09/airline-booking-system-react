import { act } from '@testing-library/react';
import type { Booking } from '@/features/booking';
import { useBookingsStore } from '@/features/booking';
import type { FlightOffer } from '@/features/flights';

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

describe('bookingsStore status updates', () => {
  beforeEach(() => {
    act(() => {
      useBookingsStore.getState().clearBookings();
    });
  });

  it('cancels an eligible booking', () => {
    act(() => {
      useBookingsStore.getState().saveBooking(
        makeBooking({ reference: 'AB-CANCEL', status: 'CONFIRMED' }),
      );
    });

    let result: Booking | undefined;
    act(() => {
      result = useBookingsStore.getState().cancelBooking('AB-CANCEL');
    });

    expect(result?.status).toBe('CANCELLED');
    expect(useBookingsStore.getState().getBookingByReference('AB-CANCEL')?.status).toBe(
      'CANCELLED',
    );
  });

  it('checks in a confirmed upcoming booking', () => {
    act(() => {
      useBookingsStore.getState().saveBooking(
        makeBooking({ reference: 'AB-CI', status: 'CONFIRMED' }),
      );
    });

    let result: Booking | undefined;
    act(() => {
      result = useBookingsStore.getState().checkInBooking('AB-CI');
    });

    expect(result?.status).toBe('CHECKED_IN');
  });

  it('rejects cancel for already cancelled bookings', () => {
    act(() => {
      useBookingsStore.getState().saveBooking(
        makeBooking({ reference: 'AB-DONE', status: 'CANCELLED' }),
      );
    });

    let result: Booking | undefined;
    act(() => {
      result = useBookingsStore.getState().cancelBooking('AB-DONE');
    });

    expect(result).toBeUndefined();
  });
});
