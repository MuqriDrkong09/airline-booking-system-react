import type { Booking } from '@/features/booking';
import {
  calculateCancellationQuote,
  canCancelBooking,
  CANCELLATION_FEE_REFUNDABLE_MINIMUM,
  CANCELLATION_FEE_REFUNDABLE_PER_PASSENGER,
  isCompletedFlight,
} from '@/features/booking';
import type { FlightOffer } from '@/features/flights';

function makeBooking(overrides?: {
  status?: Booking['status'];
  refundable?: boolean;
  departureTime?: string;
  finalTotal?: number;
  baseFare?: number;
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
      refundPolicy: 'Cancellation fee applies.',
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
      baseFare: overrides?.baseFare ?? 200,
      seatCost: 0,
      baggageCost: 0,
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
    expect(
      canCancelBooking(makeBooking({ departureTime: '2020-01-01T09:00' }), '2026-09-29'),
    ).toBe(false);
    expect(isCompletedFlight(makeBooking({ status: 'COMPLETED' }), '2026-09-29')).toBe(true);
  });

  it('allows upcoming confirmed bookings', () => {
    expect(canCancelBooking(makeBooking(), '2026-09-29')).toBe(true);
  });

  it('calculates fee and refund for refundable fares', () => {
    const quote = calculateCancellationQuote(makeBooking({ refundable: true, finalTotal: 216 }));
    expect(quote.cancellationFee).toBe(
      Math.max(CANCELLATION_FEE_REFUNDABLE_MINIMUM, CANCELLATION_FEE_REFUNDABLE_PER_PASSENGER),
    );
    expect(quote.refundAmount).toBe(216 - quote.cancellationFee);
    expect(quote.finalStatus).toBe('REFUNDED');
  });

  it('forfeits base fare for non-refundable bookings', () => {
    const quote = calculateCancellationQuote(
      makeBooking({ refundable: false, baseFare: 200, finalTotal: 216 }),
    );
    expect(quote.cancellationFee).toBeGreaterThanOrEqual(200);
    expect(quote.refundAmount).toBe(216 - quote.cancellationFee);
  });
});
