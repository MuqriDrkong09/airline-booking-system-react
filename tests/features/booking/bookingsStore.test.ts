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
    checkedInPassengerIds: [],
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

  it('cancels an eligible booking and records refund outcome', () => {
    act(() => {
      useBookingsStore.getState().saveBooking(
        makeBooking({ reference: 'AB-CANCEL', status: 'CONFIRMED' }),
      );
    });

    let result: Booking | undefined;
    act(() => {
      result = useBookingsStore.getState().cancelBooking('AB-CANCEL');
    });

    expect(result?.status).toBe('REFUNDED');
    expect(result?.cancellation?.refundAmount).toBeGreaterThan(0);
    expect(useBookingsStore.getState().getBookingByReference('AB-CANCEL')?.status).toBe(
      'REFUNDED',
    );
  });

  it('rejects cancel for completed flights', () => {
    act(() => {
      useBookingsStore.getState().saveBooking(
        makeBooking({
          reference: 'AB-DONE-FLIGHT',
          status: 'CONFIRMED',
          flight: { departureTime: '2020-01-01T09:00' } as FlightOffer,
        }),
      );
    });

    let result: Booking | undefined;
    act(() => {
      result = useBookingsStore.getState().cancelBooking('AB-DONE-FLIGHT');
    });

    expect(result).toBeUndefined();
  });

  it('checks in selected passengers on a confirmed booking in the check-in window', () => {
    const departure = new Date();
    departure.setHours(departure.getHours() + 24);
    const pad = (value: number) => String(value).padStart(2, '0');
    const departureTime = `${departure.getFullYear()}-${pad(departure.getMonth() + 1)}-${pad(departure.getDate())}T${pad(departure.getHours())}:${pad(departure.getMinutes())}`;

    act(() => {
      useBookingsStore.getState().saveBooking(
        makeBooking({
          reference: 'AB-CI',
          status: 'CONFIRMED',
          flight: { departureTime } as FlightOffer,
        }),
      );
    });

    let result: Booking | undefined;
    act(() => {
      result = useBookingsStore.getState().checkInBooking('AB-CI', ['p1']);
    });

    expect(result?.status).toBe('CHECKED_IN');
    expect(result?.checkedInPassengerIds).toEqual(['p1']);
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
