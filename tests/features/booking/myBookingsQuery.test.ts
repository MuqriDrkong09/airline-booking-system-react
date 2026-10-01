import type { Booking } from '@/features/booking';
import { canCheckInBooking, getBookingTab } from '@/features/booking/utils/bookingStatus';
import { canCancelBooking } from '@/features/booking/utils/cancellationQuote';
import {
  MY_BOOKINGS_PAGE_SIZE,
  queryMyBookings,
} from '@/features/booking/utils/myBookingsQuery';
import type { FlightOffer } from '@/features/flights';

function makeFlight(overrides?: Partial<FlightOffer>): FlightOffer {
  return {
    id: 'FL-100',
    airline: {
      code: overrides?.airline?.code ?? 'AB',
      name: overrides?.airline?.name ?? 'AeroBook Air',
    },
    flightNumber: overrides?.flightNumber ?? 'AB100',
    aircraft: overrides?.aircraft ?? { model: 'A320' },
    origin: {
      code: overrides?.origin?.code ?? 'KUL',
      city: overrides?.origin?.city ?? 'Kuala Lumpur',
      airportName: overrides?.origin?.airportName ?? 'KLIA',
    },
    destination: {
      code: overrides?.destination?.code ?? 'NRT',
      city: overrides?.destination?.city ?? 'Tokyo',
      airportName: overrides?.destination?.airportName ?? 'Narita',
    },
    departureTime: overrides?.departureTime ?? '2026-10-20T09:00',
    arrivalTime: overrides?.arrivalTime ?? '2026-10-20T17:00',
    durationMinutes: overrides?.durationMinutes ?? 420,
    stops: overrides?.stops ?? 0,
    stopAirports: overrides?.stopAirports ?? [],
    cabinClass: overrides?.cabinClass ?? 'ECONOMY',
    baggage: overrides?.baggage ?? { cabinKg: 7, checkedKg: 20, pieces: 1 },
    amenities: overrides?.amenities ?? {
      meals: 'Hot meal',
      wifi: true,
      wifiNotes: '',
      seatInformation: '',
    },
    policies: overrides?.policies ?? {
      refundPolicy: '',
      changePolicy: '',
      fareConditions: [],
    },
    segments: overrides?.segments ?? [],
    price: overrides?.price ?? { amount: 200, currency: 'USD' },
    availableSeats: overrides?.availableSeats ?? 10,
    refundable: overrides?.refundable ?? true,
    baggageIncluded: overrides?.baggageIncluded ?? true,
  } as FlightOffer;
}

function makeBooking(
  overrides: Partial<Omit<Booking, 'flight' | 'reference' | 'status'>> & {
    reference: string;
    status: Booking['status'];
    flight?: Partial<FlightOffer>;
  },
): Booking {
  const { flight: flightOverrides, ...rest } = overrides;
  const flight = makeFlight(flightOverrides);

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
      billingName: 'Ada Lovelace',
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

describe('bookingStatus helpers', () => {
  it('classifies bookings into upcoming, past, and cancelled tabs', () => {
    expect(
      getBookingTab(
        makeBooking({
          reference: 'AB-1',
          status: 'CONFIRMED',
          flight: { departureTime: '2026-10-01T09:00' },
        }),
        '2026-09-29',
      ),
    ).toBe('upcoming');

    expect(
      getBookingTab(
        makeBooking({
          reference: 'AB-2',
          status: 'COMPLETED',
          flight: { departureTime: '2026-01-01T09:00' },
        }),
        '2026-09-29',
      ),
    ).toBe('past');

    expect(
      getBookingTab(makeBooking({ reference: 'AB-3', status: 'CANCELLED' }), '2026-09-29'),
    ).toBe('cancelled');
  });

  it('gates cancel and check-in by status and departure date', () => {
    const now = new Date(2026, 8, 29, 12, 0, 0); // 2026-09-29 12:00 local
    const withinCheckInWindow = makeBooking({
      reference: 'AB-UP',
      status: 'CONFIRMED',
      // 24h ahead → inside the 48h open / 1h close check-in window
      flight: { departureTime: '2026-09-30T12:00' },
    });
    const past = makeBooking({
      reference: 'AB-PAST',
      status: 'CONFIRMED',
      flight: { departureTime: '2026-01-01T09:00' },
    });

    expect(canCancelBooking(withinCheckInWindow, '2026-09-29')).toBe(true);
    expect(canCancelBooking(past, '2026-09-29')).toBe(false);
    expect(canCheckInBooking(withinCheckInWindow, '2026-09-29', now)).toBe(true);
    expect(canCheckInBooking(past, '2026-09-29', now)).toBe(false);
  });
});

describe('queryMyBookings', () => {
  const todayIso = '2026-09-29';
  const bookings = [
    makeBooking({
      reference: 'AB-UP1',
      status: 'CONFIRMED',
      createdAt: '2026-09-20T10:00:00.000Z',
      flight: {
        departureTime: '2026-10-05T09:00',
        airline: { code: 'AK', name: 'AirAsia' },
        flightNumber: 'AK674',
        origin: { code: 'KUL', city: 'Kuala Lumpur', airportName: 'KLIA' },
        destination: { code: 'PEN', city: 'George Town', airportName: 'PEN' },
      },
    }),
    makeBooking({
      reference: 'AB-UP2',
      status: 'CONFIRMED',
      createdAt: '2026-09-21T10:00:00.000Z',
      flight: { departureTime: '2026-10-10T09:00' },
    }),
    makeBooking({
      reference: 'AB-PAST1',
      status: 'COMPLETED',
      flight: { departureTime: '2026-01-10T09:00' },
    }),
    makeBooking({
      reference: 'AB-CXL1',
      status: 'CANCELLED',
      flight: { departureTime: '2026-10-15T09:00' },
    }),
    ...Array.from({ length: 6 }, (_, index) =>
      makeBooking({
        reference: `AB-PAGE${index}`,
        status: 'CONFIRMED',
        createdAt: `2026-09-1${index}T10:00:00.000Z`,
        flight: { departureTime: `2026-11-0${index + 1}T09:00` },
      }),
    ),
  ];

  it('filters by tab and search, and paginates', () => {
    const upcoming = queryMyBookings(bookings, {
      tab: 'upcoming',
      search: '',
      sort: 'departure_asc',
      page: 1,
      todayIso,
    });

    expect(upcoming.counts).toEqual({
      upcoming: 8,
      past: 1,
      cancelled: 1,
    });
    expect(upcoming.total).toBe(8);
    expect(upcoming.items).toHaveLength(MY_BOOKINGS_PAGE_SIZE);
    expect(upcoming.pageCount).toBe(2);

    const search = queryMyBookings(bookings, {
      tab: 'upcoming',
      search: 'airasia',
      sort: 'departure_asc',
      page: 1,
      todayIso,
    });
    expect(search.total).toBe(1);
    expect(search.items[0]?.reference).toBe('AB-UP1');

    const page2 = queryMyBookings(bookings, {
      tab: 'upcoming',
      search: '',
      sort: 'departure_asc',
      page: 2,
      todayIso,
    });
    expect(page2.items).toHaveLength(3);
  });
});
