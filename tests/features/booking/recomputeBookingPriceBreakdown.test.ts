import type { Booking } from '@/features/booking';
import { recomputeBookingPriceBreakdown } from '@/features/booking/utils/recomputeBookingPriceBreakdown';
import type { FlightOffer } from '@/features/flights';

function makeBooking(overrides?: Partial<Booking>): Booking {
  const flight = {
    id: 'FL-200',
    price: { amount: 150, currency: 'USD' },
  } as FlightOffer;

  return {
    id: 'bkg-1',
    reference: 'AB-RECOMP',
    status: 'CONFIRMED',
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
    flightId: flight.id,
    cabinClass: 'ECONOMY',
    flight,
    searchCriteria: null,
    passengers: [
      {
        id: 'adult-1',
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
        id: 'infant-1',
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
        associatedAdultId: 'adult-1',
      },
    ],
    seats: [{ passengerId: 'adult-1', seatId: '10A', label: '10A', price: 30 }],
    baggage: [
      {
        passengerId: 'adult-1',
        cabinKg: 7,
        checkedKg: 30,
        additionalKg: 0,
      },
      {
        passengerId: 'infant-1',
        cabinKg: 7,
        checkedKg: 0,
        additionalKg: 0,
      },
    ],
    meals: [],
    addons: [],
    promoCode: null,
    payment: {
      method: null,
      billingName: '',
      billingEmail: '',
      cardBrand: '',
      cardLast4: '',
    },
    priceBreakdown: {
      currency: 'USD',
      baseFare: 0,
      seatCost: 0,
      baggageCost: 0,
      mealCost: 0,
      addonCost: 0,
      subtotal: 0,
      discount: 0,
      taxes: 0,
      finalTotal: 0,
    },
    transactionId: 'TXN-RECOMP',
    ...overrides,
  };
}

describe('recomputeBookingPriceBreakdown', () => {
  it('recomputes fare, seats, and economy baggage overage from booking selections', () => {
    const breakdown = recomputeBookingPriceBreakdown(makeBooking());

    // One fare-paying passenger at 150 + seat 30 + checked 30KG overage (55)
    expect(breakdown.baseFare).toBe(150);
    expect(breakdown.seatCost).toBe(30);
    expect(breakdown.baggageCost).toBe(55);
    expect(breakdown.subtotal).toBe(235);
    expect(breakdown.currency).toBe('USD');
    expect(breakdown.finalTotal).toBeGreaterThan(breakdown.subtotal);
  });

  it('applies promo discounts when recomputing totals', () => {
    const breakdown = recomputeBookingPriceBreakdown(
      makeBooking({
        promoCode: {
          code: 'SAVE10',
          discountType: 'PERCENT',
          discountValue: 10,
          maxDiscount: null,
          currency: 'USD',
          description: '10% off',
        },
      }),
    );

    expect(breakdown.discount).toBe(23.5);
    expect(breakdown.finalTotal).toBeLessThan(breakdown.subtotal);
  });
});
