import type { BookingPromoCode, BookingSeatSelection } from '@/features/booking';
import {
  BOOKING_TAX_RATE,
  buildPriceBreakdown,
  calculateDiscount,
  calculateSeatCost,
  countFarePassengers,
  priceBreakdownFromBooking,
  roundMoney,
  toSafePaymentInfo,
} from '@/features/booking/utils/priceBreakdown';
import type { FlightOffer } from '@/features/flights';
import type { PassengerDraft } from '@/features/passengers';

const percentPromo: BookingPromoCode = {
  code: 'SAVE10',
  discountType: 'PERCENT',
  discountValue: 10,
  maxDiscount: null,
  currency: 'USD',
  description: '10% off',
};

const fixedPromo: BookingPromoCode = {
  code: 'FLAT50',
  discountType: 'FIXED',
  discountValue: 50,
  maxDiscount: null,
  currency: 'USD',
  description: 'USD50 off',
};

function passenger(partial: Pick<PassengerDraft, 'id' | 'type'>): PassengerDraft {
  return {
    id: partial.id,
    type: partial.type,
    title: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    passportNumber: '',
    passportExpiry: '',
    email: '',
    phone: '',
    associatedAdultId: '',
  };
}

describe('priceBreakdown', () => {
  it('counts fare-paying passengers and excludes infants', () => {
    expect(
      countFarePassengers([
        passenger({ id: 'a', type: 'ADULT' }),
        passenger({ id: 'c', type: 'CHILD' }),
        passenger({ id: 'i', type: 'INFANT' }),
      ]),
    ).toBe(2);
  });

  it('sums seat fees', () => {
    const seats: BookingSeatSelection[] = [
      { passengerId: 'a', seatId: '1A', label: '1A', price: 25 },
      { passengerId: 'b', seatId: '1B', label: '1B', price: 40.5 },
    ];
    expect(calculateSeatCost(seats)).toBe(65.5);
  });

  it('returns zero discount when promo is missing or subtotal is non-positive', () => {
    expect(calculateDiscount(100, null)).toBe(0);
    expect(calculateDiscount(0, percentPromo)).toBe(0);
    expect(calculateDiscount(-10, fixedPromo)).toBe(0);
  });

  it('applies percent and fixed discounts and caps at subtotal and maxDiscount', () => {
    expect(calculateDiscount(200, percentPromo)).toBe(20);
    expect(calculateDiscount(200, fixedPromo)).toBe(50);
    expect(
      calculateDiscount(200, {
        ...percentPromo,
        discountValue: 50,
        maxDiscount: 30,
      }),
    ).toBe(30);
    expect(
      calculateDiscount(40, {
        ...fixedPromo,
        discountValue: 100,
      }),
    ).toBe(40);
  });

  it('rounds money to two decimal places', () => {
    expect(roundMoney(10.005)).toBe(10.01);
    expect(roundMoney(10.004)).toBe(10);
  });

  it('builds a breakdown with tax on the post-discount taxable amount', () => {
    const breakdown = buildPriceBreakdown({
      baseFare: 200,
      seatCost: 25,
      baggageCost: 35,
      mealCost: 10,
      addonCost: 15,
      promoCode: percentPromo,
      currency: 'USD',
    });

    // subtotal 285, 10% discount 28.5, taxable 256.5, tax 8%
    expect(breakdown.subtotal).toBe(285);
    expect(breakdown.discount).toBe(28.5);
    expect(breakdown.taxes).toBe(roundMoney(256.5 * BOOKING_TAX_RATE));
    expect(breakdown.finalTotal).toBe(roundMoney(256.5 + breakdown.taxes));
    expect(breakdown.currency).toBe('USD');
  });

  it('derives booking totals from flight fare, seats, ancillaries, and promo', () => {
    const flight = {
      id: 'FL-1',
      price: { amount: 100, currency: 'MYR' },
    } as FlightOffer;

    const breakdown = priceBreakdownFromBooking({
      selectedFlight: flight,
      passengers: [
        passenger({ id: 'a', type: 'ADULT' }),
        passenger({ id: 'i', type: 'INFANT' }),
      ],
      seats: [{ passengerId: 'a', seatId: '12A', label: '12A', price: 20 }],
      baggageTotal: 15,
      mealTotal: 8,
      addons: [],
      promoCode: fixedPromo,
    });

    expect(breakdown.baseFare).toBe(100);
    expect(breakdown.seatCost).toBe(20);
    expect(breakdown.subtotal).toBe(143);
    expect(breakdown.discount).toBe(50);
    expect(breakdown.currency).toBe('MYR');
  });

  it('falls back to one fare unit when a flight exists but no fare-paying passengers', () => {
    const flight = {
      id: 'FL-1',
      price: { amount: 180, currency: 'USD' },
    } as FlightOffer;

    const breakdown = priceBreakdownFromBooking({
      selectedFlight: flight,
      passengers: [passenger({ id: 'i', type: 'INFANT' })],
      seats: [],
      baggageTotal: 0,
      mealTotal: 0,
      addons: [],
      promoCode: null,
    });

    expect(breakdown.baseFare).toBe(180);
  });

  it('keeps only safe payment fields and last4 digits', () => {
    expect(
      toSafePaymentInfo({
        method: 'CREDIT_CARD',
        billingName: 'Ada',
        billingEmail: 'ada@example.com',
        cardBrand: 'visa',
        cardLast4: '4111111111111111',
        cardNumber: '4111111111111111',
        cvv: '123',
      }),
    ).toEqual({
      method: 'CREDIT_CARD',
      billingName: 'Ada',
      billingEmail: 'ada@example.com',
      cardBrand: 'visa',
      cardLast4: '1111',
    });
  });
});
