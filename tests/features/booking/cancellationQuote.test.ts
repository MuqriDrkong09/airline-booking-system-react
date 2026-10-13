import type { Booking } from '@/features/booking';
import {
  calculateCancellationQuote,
  canCancelBooking,
  CANCELLATION_ANCILLARY_RETENTION_RATE,
  CANCELLATION_FEE_REFUNDABLE_MINIMUM,
  CANCELLATION_FEE_REFUNDABLE_PER_PASSENGER,
  getCancellationBlockedReason,
  isCompletedFlight,
} from '@/features/booking';
import type { FlightOffer } from '@/features/flights';

function makeBooking(overrides?: {
  status?: Booking['status'];
  refundable?: boolean;
  departureTime?: string;
  finalTotal?: number;
  baseFare?: number;
  seatCost?: number;
  baggageCost?: number;
  passengers?: Booking['passengers'];
  refundPolicy?: string;
}): Booking {
  const flight = {
    id: 'FL-100',
    airline: { code: 'AB', name: 'AeroBook Air' },
    flightNumber: 'AB100',
    aircraft: { model: 'A320' },
    origin: { code: 'KUL', city: 'Kuala Lumpur', airportName: 'KLIA' },
    destination: { code: 'NRT', city: 'Tokyo', airportName: 'Narita' },
    departureTime: overrides?.departureTime ?? '2099-10-20T09:00',
    arrivalTime: '2099-10-20T17:00',
    durationMinutes: 420,
    stops: 0,
    stopAirports: [],
    cabinClass: 'ECONOMY',
    baggage: { cabinKg: 7, checkedKg: 20, pieces: 1 },
    amenities: { meals: '', wifi: false, wifiNotes: '', seatInformation: '' },
    policies: {
      refundPolicy: overrides?.refundPolicy ?? 'Cancellation fee applies.',
      changePolicy: 'Changes allowed',
      fareConditions: ['Non-transferable'],
    },
    segments: [],
    price: { amount: 200, currency: 'USD' },
    availableSeats: 10,
    refundable: overrides?.refundable ?? true,
    baggageIncluded: true,
  } as FlightOffer;

  return {
    id: 'bkg-cxl',
    reference: 'AB-CXLQUOTE',
    status: overrides?.status ?? 'CONFIRMED',
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
    flightId: flight.id,
    cabinClass: 'ECONOMY',
    flight,
    searchCriteria: null,
    passengers: overrides?.passengers ?? [
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
      baseFare: overrides?.baseFare ?? 200,
      seatCost: overrides?.seatCost ?? 0,
      baggageCost: overrides?.baggageCost ?? 0,
      mealCost: 0,
      addonCost: 0,
      subtotal: overrides?.baseFare ?? 200,
      discount: 0,
      taxes: 16,
      finalTotal: overrides?.finalTotal ?? 216,
    },
    transactionId: 'TXN-CXL',
  };
}

describe('cancellationQuote', () => {
  it('blocks completed and departed flights', () => {
    expect(canCancelBooking(makeBooking({ status: 'COMPLETED' }), '2026-09-29')).toBe(false);
    expect(canCancelBooking(makeBooking({ departureTime: '2020-01-01T09:00' }), '2026-09-29')).toBe(
      false,
    );
    expect(isCompletedFlight(makeBooking({ status: 'COMPLETED' }), '2026-09-29')).toBe(true);
  });

  it('allows upcoming confirmed and pending bookings', () => {
    expect(canCancelBooking(makeBooking(), '2026-09-29')).toBe(true);
    expect(canCancelBooking(makeBooking({ status: 'PENDING' }), '2026-09-29')).toBe(true);
  });

  it('blocks already cancelled or in-progress cancellation requests', () => {
    expect(canCancelBooking(makeBooking({ status: 'CANCELLED' }), '2026-09-29')).toBe(false);
    expect(canCancelBooking(makeBooking({ status: 'CANCELLATION_REQUESTED' }), '2026-09-29')).toBe(
      false,
    );
    expect(canCancelBooking(makeBooking({ status: 'CHECKED_IN' }), '2026-09-29')).toBe(false);
  });

  it('returns user-facing blocked reasons for non-cancellable bookings', () => {
    expect(
      getCancellationBlockedReason(makeBooking({ status: 'CANCELLATION_REQUESTED' }), '2026-09-29'),
    ).toMatch(/already in progress/i);
    expect(getCancellationBlockedReason(makeBooking({ status: 'REFUNDED' }), '2026-09-29')).toMatch(
      /already been cancelled/i,
    );
    expect(
      getCancellationBlockedReason(
        makeBooking({ departureTime: '2020-01-01T09:00' }),
        '2026-09-29',
      ),
    ).toMatch(/cannot be cancelled/i);
    expect(
      getCancellationBlockedReason(makeBooking({ status: 'CHECKED_IN' }), '2026-09-29'),
    ).toMatch(/checked-in/i);
    expect(getCancellationBlockedReason(makeBooking(), '2026-09-29')).toBeNull();
  });

  it('calculates fee and refund for refundable fares', () => {
    const quote = calculateCancellationQuote(makeBooking({ refundable: true, finalTotal: 216 }));
    expect(quote.cancellationFee).toBe(
      Math.max(CANCELLATION_FEE_REFUNDABLE_MINIMUM, CANCELLATION_FEE_REFUNDABLE_PER_PASSENGER),
    );
    expect(quote.refundAmount).toBe(216 - quote.cancellationFee);
    expect(quote.finalStatus).toBe('REFUNDED');
  });

  it('scales refundable fees by fare-paying passenger count and excludes infants', () => {
    const quote = calculateCancellationQuote(
      makeBooking({
        refundable: true,
        finalTotal: 500,
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
          {
            id: 'p2',
            type: 'CHILD',
            title: 'Mr',
            firstName: 'Alan',
            lastName: 'Turing',
            dateOfBirth: '2015-01-01',
            gender: 'MALE',
            nationality: 'MY',
            passportNumber: 'B123',
            passportExpiry: '2030-01-01',
            email: '',
            phone: '',
            associatedAdultId: '',
          },
          {
            id: 'p3',
            type: 'INFANT',
            title: 'Ms',
            firstName: 'Grace',
            lastName: 'Hopper',
            dateOfBirth: '2025-01-01',
            gender: 'FEMALE',
            nationality: 'MY',
            passportNumber: '',
            passportExpiry: '',
            email: '',
            phone: '',
            associatedAdultId: 'p1',
          },
        ],
      }),
    );

    expect(quote.passengerCount).toBe(2);
    expect(quote.cancellationFee).toBe(CANCELLATION_FEE_REFUNDABLE_PER_PASSENGER * 2);
  });

  it('forfeits base fare for non-refundable bookings and retains a share of ancillaries', () => {
    const quote = calculateCancellationQuote(
      makeBooking({
        refundable: false,
        baseFare: 200,
        seatCost: 40,
        baggageCost: 60,
        finalTotal: 324,
        refundPolicy: '',
      }),
    );

    const retainedAncillaries = Math.round(100 * CANCELLATION_ANCILLARY_RETENTION_RATE * 100) / 100;
    expect(quote.cancellationFee).toBe(200 + retainedAncillaries);
    expect(quote.refundAmount).toBe(324 - quote.cancellationFee);
    expect(quote.policySummary).toMatch(/non-refundable/i);
  });

  it('marks final status CANCELLED when the refund amount is zero', () => {
    const quote = calculateCancellationQuote(
      makeBooking({
        refundable: false,
        baseFare: 200,
        finalTotal: 200,
        seatCost: 0,
        baggageCost: 0,
      }),
    );

    expect(quote.refundAmount).toBe(0);
    expect(quote.finalStatus).toBe('CANCELLED');
  });
});
